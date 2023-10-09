import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';

export const excludePostOptions = {
  mutationKey: 'exclude_post',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/qa_exclude/${path}`, data);
    return res;
  },
};

export const excludePutOptions = {
  mutationKey: 'exclude_put',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_admin/qa_exclude/${path}`, data);
    return res;
  },
};

export const excludeDelOptions = {
  mutationKey: 'exclude_del',
  mutationFn: async (mutation_data) => {
    const {path} = mutation_data;
    const {data: res} = await apiClient.delete(`/sensor_admin/qa_exclude/${path}`);
    return res;
  },
};

export const useExclude = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...excludePostOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['qa_all', Number(variables.path)]);
      toast.success('Punkter ekskluderet');
    },
  });

  const put = useMutation({
    ...excludePutOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: ({context}) => {
      queryClient.invalidateQueries(['qa_all']);
      toast.success('Ændringer gemt');
    },
  });

  const del = useMutation({
    ...excludeDelOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: ({context}) => {
      queryClient.invalidateQueries(['qa_all']);
      toast.success('Slettet');
    },
  });

  return {post, put, del};
};
