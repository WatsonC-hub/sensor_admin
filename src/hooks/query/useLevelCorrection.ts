import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {rerunToast} from '~/helpers/toasts';

type LevelCorrectionPayload = {
  path: string;
  data: {
    date: string;
    comment: string | undefined;
  };
};

type LevelCorrectionDelPayload = {
  path: string;
};

const levelCorrectionPostOptions = {
  mutationKey: ['level_correction_post'],
  mutationFn: async (mutation_data: LevelCorrectionPayload) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/qa_levelcorrection/${path}`, data);
    return res;
  },
};

const levelCorrectionPutOptions = {
  mutationKey: ['level_correction_put'],
  mutationFn: async (mutation_data: LevelCorrectionPayload) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_admin/qa_levelcorrection/${path}`, data);
    return res;
  },
};

const levelCorrectionDelOptions = {
  mutationKey: ['level_correction_del'],
  mutationFn: async (mutation_data: LevelCorrectionDelPayload) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_admin/qa_levelcorrection/${path}`);
    return res;
  },
};

export const useLevelCorrection = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...levelCorrectionPostOptions,
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

  const put = useMutation({
    ...levelCorrectionPutOptions,
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

  const del = useMutation({
    ...levelCorrectionDelOptions,
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

  return {post, put, del};
};
