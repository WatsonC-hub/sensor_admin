import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister';
import {
  matchQuery,
  MutationCache,
  QueryClient,
  QueryKey,
  UseMutationOptions,
} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {toast} from 'react-toastify';
import localforage from 'localforage';
import {apiClient} from '~/apiClient';
import {httpStatusDescriptions} from '~/consts';
import {excludeDelOptions, excludePostOptions, excludePutOptions} from '~/hooks/query/useExclude';
import {queryKeys} from './helpers/QueryKeyFactoryHelper';
import {
  deleteImageMutationOptions,
  postImageMutationOptions,
  putImageMutationOptions,
} from './hooks/query/useImageUpload';

type ErrorDetail = {
  type: string;
  loc: string[];
  msg: string;
  input: unknown;
};

type ErrorResponse = {
  detail: ErrorDetail | string;
};

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidates?: Array<QueryKey>;
      optOutGeneralInvalidations?: boolean;
    };
  }
}

export type APIError = AxiosError<ErrorResponse>;

type AppMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, APIError, TVariables>,
  'mutationFn'
> & {
  mutationFn: (variables: TVariables) => Promise<TData>;
};

export const makeAppMutationOptions = <TData, TVariables>(
  options: AppMutationOptions<TData, TVariables>
) => options;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 5,
      networkMode: 'offlineFirst',
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          if (error.response?.status == undefined) {
            return false;
          }
          if (![500, 501, 502, 503].includes(error.response?.status)) {
            return false;
          }
        }

        if (failureCount < 3) {
          return true;
        }
        return false;
      },
    },
    mutations: {
      retry: 0,
      networkMode: 'offlineFirst', // ensures they queue
      meta: {
        optOutGeneralInvalidations: false,
      },
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return (
            mutation.meta?.invalidates?.some((queryKey) => {
              return queryKey.every((key) => query.queryKey.includes(key));
            }) ?? false
          );
        },
      });

      if (mutation.meta?.optOutGeneralInvalidations != true)
        queryClient.invalidateQueries({
          predicate: (query) => {
            if (matchQuery({queryKey: ['map']}, query)) return true;
            if (matchQuery({queryKey: ['borehole_map']}, query)) return true;
            if (matchQuery({queryKey: ['timeseries_status']}, query)) return true;
            if (matchQuery({queryKey: ['all_tasks']}, query)) return true;

            return false;
          },
        });
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const localError = error as APIError;
        const detail = localError.response?.data.detail;

        if (detail) {
          if (typeof detail === 'string') {
            toast.error(detail);
            return;
          }

          if (Array.isArray(detail)) {
            let errorString = 'Valideringsfejl:\n';
            (detail as ErrorDetail[]).forEach((item) => {
              errorString += `${item.loc.join('.')} - ${item.msg}\n`;
            });
            toast.error(errorString, {
              style: {whiteSpace: 'pre-line'},
            });

            return;
          }

          return;
        }

        const status = localError.response?.status.toString();

        if (status && status in httpStatusDescriptions) {
          toast.error(httpStatusDescriptions[status as keyof typeof httpStatusDescriptions]);
          return;
        }
        toast.error('Der skete en fejl');
      }
    },
    onMutate: async (_, mutation) => {
      if (mutation.state.isPaused) {
        toast.info('Registrering lagt i kø');
      }
    },
  }),
});

queryClient.setMutationDefaults(['pejling'], {
  mutationFn: async (data: {gid: number; stationid: number}) => {
    await queryClient.cancelQueries({queryKey: queryKeys.Timeseries.allPejling()});
    if (data.gid === -1) {
      return apiClient.post(`/sensor_field/station/measurements/${data.stationid}`, data);
    } else {
      return apiClient.put(
        `/sensor_field/station/measurements/${data.stationid}/${data.gid}`,
        data
      );
    }
  },
});

const imageTypes = ['station', 'borehole'] as const;

imageTypes.forEach((type) => {
  queryClient.setMutationDefaults(['image_post', type], postImageMutationOptions(type));
  queryClient.setMutationDefaults(['image_put', type], putImageMutationOptions(type));
  queryClient.setMutationDefaults(['image_del', type], deleteImageMutationOptions(type));
});

queryClient.setMutationDefaults(excludePostOptions.mutationKey, excludePostOptions);
queryClient.setMutationDefaults(excludePutOptions.mutationKey, excludePutOptions);
queryClient.setMutationDefaults(excludeDelOptions.mutationKey, excludeDelOptions);

const persister = createAsyncStoragePersister({
  storage: localforage,
});

export {persister, queryClient};
