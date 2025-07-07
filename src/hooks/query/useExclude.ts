import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {rerunToast} from '~/helpers/toasts';
import {useAppContext} from '~/state/contexts';

interface ExcludeBase {
  path: string;
  data?: any;
}

export type ExcludeData = {
  ts_id?: number;
  gid?: number;
  min_value: number | null;
  max_value: number | null;
  startdate: string | null;
  enddate: string | null;
  comment?: string;
};

interface ExcludePost extends ExcludeBase {
  data: ExcludeData;
}

interface ExcludePut extends ExcludePost {
  data: ExcludeData;
}

export const excludePostOptions = {
  mutationKey: ['exclude_post'],
  mutationFn: async (mutation_data: ExcludePost) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/qa_exclude/${path}`, data);
    return res;
  },
};

export const excludePutOptions = {
  mutationKey: ['exclude_put'],
  mutationFn: async (mutation_data: ExcludePut) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_admin/qa_exclude/${path}`, data);
    return res;
  },
};

export const excludeDelOptions = {
  mutationKey: ['exclude_del'],
  mutationFn: async (mutation_data: ExcludeBase) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_admin/qa_exclude/${path}`);
    return res;
  },
};

export const useExclude = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const queryClient = useQueryClient();

  const post = useMutation({
    ...excludePostOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.Timeseries.QAWithTsId(Number(variables.path)),
      });
      rerunToast(ts_id);
    },
  });

  const put = useMutation({
    ...excludePutOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.Timeseries.QA()});
      rerunToast(ts_id);
    },
  });

  const del = useMutation({
    ...excludeDelOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.Timeseries.QA()});
      rerunToast(ts_id);
    },
  });

  return {post, put, del};
};
