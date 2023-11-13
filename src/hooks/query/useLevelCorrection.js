import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';
import {rerunToast} from 'src/helpers/toasts';

export const levelCorrectionPostOptions = {
  mutationKey: 'level_correction_post',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/qa_levelcorrection/${path}`, data);
    return res;
  },
};

export const levelCorrectionPutOptions = {
  mutationKey: 'level_correction_put',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_admin/qa_levelcorrection/${path}`, data);
    return res;
  },
};

export const levelCorrectionDelOptions = {
  mutationKey: 'level_correction_del',
  mutationFn: async (mutation_data) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_admin/qa_levelcorrection/${path}`);
    return res;
  },
};

export const useLevelCorrection = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...levelCorrectionPostOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['qa_all', Number(variables.path)]);
      rerunToast();
    },
  });

  const put = useMutation({
    ...levelCorrectionPutOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['qa_all']);
      rerunToast();
    },
  });

  const del = useMutation({
    ...levelCorrectionDelOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['qa_all']);
      rerunToast();
    },
  });

  return {post, put, del};
};
