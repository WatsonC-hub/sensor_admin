import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';

interface SyncBase {
  path: string;
}

type Sync = {
  sync_dmp?: boolean;
  owner_cvr?: number;
  owner_name?: string;
  jupiter?: boolean;
};

interface SyncPost extends SyncBase {
  data: Sync;
}

interface SyncPut extends SyncBase {
  data: Sync;
}

const syncPostOptions = {
  mutationKey: ['sync_post'],
  mutationFn: async (mutation_data: SyncPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/stamdata/sync/${path}`, data);
    return result;
  },
  onSuccess: () => {
    toast.success('Synkronisering er slået til');
  },
};

const syncPutOptions = {
  mutationKey: ['sync_put'],
  mutationFn: async (mutation_data: SyncPut) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/stamdata/sync/${path}`, data);
    return result;
  },
  onSuccess: () => {
    toast.success('Synkronisering er opdateret');
  },
};

const syncDelOptions = {
  mutationKey: ['sync_del'],
  mutationFn: async (mutation_data: SyncBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/stamdata/sync/${path}`);
    return result;
  },
  onSuccess: () => {
    toast.success('Synkronisering er slået fra');
  },
};

const syncGetOptions = (ts_id: number | undefined) =>
  queryOptions<Sync, APIError>({
    queryKey: ['sync', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Sync>(`/sensor_field/stamdata/sync/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined,
  });

const useSync = () => {
  const {ts_id} = useAppContext(['ts_id']);

  const syncGet = useQuery(syncGetOptions(ts_id));
  const syncPost = useMutation(syncPostOptions);
  const syncPut = useMutation(syncPutOptions);
  const syncDel = useMutation(syncDelOptions);

  return {
    get: syncGet,
    post: syncPost,
    put: syncPut,
    del: syncDel,
  };
};

export default useSync;
