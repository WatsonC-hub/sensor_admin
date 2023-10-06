import {QueryClient, MutationCache} from '@tanstack/react-query';
import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';
import {excludePostOptions, excludeDelOptions, excludePutOptions} from 'src/hooks/query/useExclude';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      retry: (failureCount, error) => {
        if (!Object.hasOwn(error, 'response')) {
          return false;
        }
        console.log(error);
        if (error.response.status === 401 || error.response.status === 404) {
          return false;
        }
        if (failureCount < 3) {
          return true;
        }
        return false;
      },
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (data) => {
      console.log('Data gemt!');
    },
    onError: (error) => {
      console.log('Data kunne ikke gemmes!', error);
    },
    onMutate: async (_, mutation) => {
      if (mutation.state.isPaused) {
        toast.info('Registrering lagt i kø');
      }
    },
  }),
});

queryClient.setMutationDefaults('pejling', {
  mutationFn: async (data) => {
    await queryClient.cancelQueries({queryKey: 'measurements'});
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

export {queryClient, persister};
