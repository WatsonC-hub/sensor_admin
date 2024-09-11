import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {MutationCache, QueryClient} from '@tanstack/react-query';
import axios from 'axios';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {httpStatusDescriptions} from '~/consts';
import {excludeDelOptions, excludePostOptions, excludePutOptions} from '~/hooks/query/useExclude';

//{"detail":[{"type":"string_too_short","loc":["body","ahhasd"],"msg":"String should have at least 10 characters","input":"hej","ctx":{"min_length":10}},{"type":"missing","loc":["body","fasdas"],"msg":"Field required","input":{"loc_id":753,"loc_name":"Throughflow_3","mainloc":"Vaarstvej2","subloc":"Vaarstvej","subsubloc":"mainloc","groups":null,"x":561895,"y":6315704,"terrainqual":"DTM","terrainlevel":16.512,"description":"Fugtighed","loctype_id":7,"initial_project_no":"19.0001","ahhasd":"hej"}}]}

type ErrorDetail = {
  type: string;
  loc: string[];
  msg: string;
  input: unknown;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401 || error.response?.status === 404) {
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
      console.log('Data gemt!');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data.detail;
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
              bodyStyle: {whiteSpace: 'pre-line'},
            });

            return;
          }

          return;
        }

        const status = error.response?.status.toString();

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
  mutationFn: async (data) => {
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
