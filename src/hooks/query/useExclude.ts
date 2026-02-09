import {useMutation} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
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
  startdate: string;
  enddate: string;
  comment?: string;
};

type ExcludeDataPost = Omit<ExcludeData, 'gid' | 'startdate' | 'enddate'> & {
  startdate: Dayjs;
  enddate: Dayjs;
};

type ExcludeDataPut = Omit<ExcludeData, 'startdate' | 'enddate'> & {
  startdate: Dayjs;
  enddate: Dayjs;
};

interface ExcludePost extends ExcludeBase {
  data: ExcludeDataPost;
}

interface ExcludePut extends ExcludeBase {
  data: ExcludeDataPut;
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

  const post = useMutation({
    ...excludePostOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      rerunToast(ts_id);
    },
    meta: {
      invalidates: [queryKeys.Timeseries.QAWithTsId(ts_id)],
    },
  });

  const put = useMutation({
    ...excludePutOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      rerunToast(ts_id);
    },
    meta: {
      invalidates: [queryKeys.Timeseries.QAWithTsId(ts_id)],
    },
  });

  const del = useMutation({
    ...excludeDelOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      rerunToast(ts_id);
    },
    meta: {
      invalidates: [queryKeys.Timeseries.QAWithTsId(ts_id)],
    },
  });

  return {post, put, del};
};
