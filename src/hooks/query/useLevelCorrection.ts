import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {invalidateFromMeta} from '~/helpers/InvalidationHelper';
import {onAdjustmentMutation} from '~/helpers/QueryKeyFactoryHelper';
import {rerunToast} from '~/helpers/toasts';
import {useAppContext} from '~/state/contexts';

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
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);

  const post = useMutation({
    ...levelCorrectionPostOptions,
    onMutate: () => onAdjustmentMutation(ts_id, loc_id, true),
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      rerunToast(ts_id);
    },
  });

  const put = useMutation({
    ...levelCorrectionPutOptions,
    onMutate: () => onAdjustmentMutation(ts_id, loc_id, false),
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      rerunToast(ts_id);
    },
  });

  const del = useMutation({
    ...levelCorrectionDelOptions,
    onMutate: () => onAdjustmentMutation(ts_id, loc_id, false),
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      rerunToast(ts_id);
    },
  });

  return {post, put, del};
};
