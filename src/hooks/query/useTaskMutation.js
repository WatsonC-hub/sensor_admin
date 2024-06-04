import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

export const taskMutationPostOptions = {
  mutationKey: 'task_mutation_post',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/task/${path}`, data);
    return res;
  },
};

export const taskMutationMarkAsDoneOptions = {
  mutationKey: 'task_mutation_mark_as_done',
  mutationFn: async (mutation_data) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_admin/task/${path}/mark_as_done`, data);
    return res;
  },
};

export const useTaskMutation = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...taskMutationPostOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['overblik'],
      });
      //   toast.success('Registreret');
    },
  });

  const markAsDone = useMutation({
    ...taskMutationMarkAsDoneOptions,
    onError: (error) => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['overblik'],
      });
      //   toast.success('Færdiggjort');
    },
  });

  return {post, markAsDone};
};
