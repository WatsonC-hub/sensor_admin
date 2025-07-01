import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {MutationCache, QueryClient} from '@tanstack/react-query';
import axios, {AxiosError} from 'axios';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {httpStatusDescriptions} from '~/consts';
import {excludeDelOptions, excludePostOptions, excludePutOptions} from '~/hooks/query/useExclude';

type ErrorDetail = {
  type: string;
  loc: string[];
  msg: string;
  input: unknown;
};

type ErrorResponse = {
  detail: ErrorDetail | string;
};

export type APIError = AxiosError<ErrorResponse>;

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
  },
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['map']});
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const localError = error as APIError;
        const detail = localError.response?.data.detail;
        if (detail) {
          console.log('detail', detail);
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
    await queryClient.cancelQueries({queryKey: ['measurements']});
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

queryClient.setMutationDefaults(excludePostOptions.mutationKey, excludePostOptions);
queryClient.setMutationDefaults(excludePutOptions.mutationKey, excludePutOptions);
queryClient.setMutationDefaults(excludeDelOptions.mutationKey, excludeDelOptions);

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

export {persister, queryClient};
