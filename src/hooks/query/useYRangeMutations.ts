import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {rerunToast} from '~/helpers/toasts';

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

  const post = useMutation({
    ...yRangePostOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['qa_all', Number(variables.path)],
      });
      rerunToast();
    },
  });

  const del = useMutation({
    ...yRangeDelOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['qa_all'],
      });
      rerunToast();
    },
  });

  return {post, del};
};
