import {useMutation} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {rerunToast} from '~/helpers/toasts';
import {useAppContext} from '~/state/contexts';

type LevelCorrectionPayload = {
  path: string;
  data: {
    date: Dayjs;
    comment?: string | null;
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
  const {ts_id} = useAppContext(['ts_id']);

  const post = useMutation({
    ...levelCorrectionPostOptions,
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
    ...levelCorrectionPutOptions,
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
    ...levelCorrectionDelOptions,
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
