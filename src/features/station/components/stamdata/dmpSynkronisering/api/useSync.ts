import {MutationOptions, queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
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

const syncPostOptions: MutationOptions<unknown, unknown, SyncPost> = {
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

const syncPutOptions: MutationOptions<unknown, unknown, SyncPut> = {
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

const syncDelOptions: MutationOptions<unknown, unknown, SyncBase> = {
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

const syncGetOptions = (ts_id: number) =>
  queryOptions<Sync, APIError>({
    queryKey: queryKeys.Timeseries.SyncData(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<Sync>(`/sensor_field/stamdata/sync/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined,
  });

const useSync = () => {
  const {ts_id} = useAppContext(['ts_id']);

  const meta = {
    invalidates: [queryKeys.Timeseries.SyncData(ts_id)],
    optOutGeneralInvalidations: true,
  };

  const syncGet = useQuery(syncGetOptions(ts_id));
  const syncPost = useMutation({
    ...syncPostOptions,
    meta,
  });
  const syncPut = useMutation({
    ...syncPutOptions,
    meta,
  });
  const syncDel = useMutation({
    ...syncDelOptions,
    meta,
  });

  return {
    get: syncGet,
    post: syncPost,
    put: syncPut,
    del: syncDel,
  };
};

export default useSync;
