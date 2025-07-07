import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {rerunToast} from '~/helpers/toasts';
import {useAppContext} from '~/state/contexts';

type YRangePayload = {
  path: string;
  data: {
    mincutoff: number;
    maxcutoff: number;
    comment?: string | undefined;
  };
};

type YRangeDelPayload = {
  path: string;
};

const yRangePostOptions = {
  mutationKey: ['y_range_post'],
  mutationFn: async (mutation_data: YRangePayload) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/qa_minmax/${path}`, data);
    return res;
  },
};

const yRangeDelOptions = {
  mutationKey: ['y_range_del'],
  mutationFn: async (mutation_data: YRangeDelPayload) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_admin/qa_minmax/${path}`);
    return res;
  },
};

export const useYRangeMutations = () => {
  const queryClient = useQueryClient();
  const {ts_id} = useAppContext(['ts_id']);

  const post = useMutation({
    ...yRangePostOptions,
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

  const del = useMutation({
    ...yRangeDelOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.Timeseries.QA(),
      });
      rerunToast(ts_id);
    },
  });

  return {post, del};
};
