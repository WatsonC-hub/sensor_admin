import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';

export const yRangePostOptions = {
  mutationKey: 'y_range_post',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/qa_minmax/${path}`, data);
    return res;
  },
};

export const yRangeDelOptions = {
  mutationKey: 'y_range_del',
  mutationFn: async (mutation_data) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_admin/qa_minmax/${path}`);
    return res;
  },
};

export const useYRangeMutations = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...yRangePostOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['qa_all', Number(variables.path)]);
      toast.success('Gemt');
    },
  });

  const del = useMutation({
    ...yRangeDelOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['qa_all']);
      toast.success('Slettet');
    },
  });

  return {post, del};
};
