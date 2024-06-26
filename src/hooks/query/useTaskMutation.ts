import {useMutation, useQueryClient, MutationFunction} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

type UpdateTask = {
  ts_id: number;
  notification_id: number;
  status?: string | null | undefined;
  enddate?: string | null | undefined;
  notify_type?: 'obs' | 'primary' | 'station' | null | undefined;
};

type TaskUpdateMutation = {
  path: string;
  data: UpdateTask;
};

export const taskMutationPostOptions = {
  mutationKey: ['task_mutation_post'],
  mutationFn: async (mutation_data: any) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.post(`/sensor_admin/task/${path}`, data);
    return res;
  },
};

export const taskMutationMarkAsDoneOptions = {
  mutationKey: ['task_mutation_mark_as_done'],
  mutationFn: async (mutation_data: any) => {
    const {path, data} = mutation_data;
    const {data: res} = await apiClient.put(`/sensor_admin/task/${path}/mark_as_done`, data);
    return res;
  },
};

export const taskMutationUpdate = {
  mutationKey: ['task_mutation_update'],
  mutationFn: async (variables: TaskUpdateMutation) => {
    const {path, data} = variables;
    const {data: res} = await apiClient.put<TaskUpdateMutation>(`/sensor_admin/task/${path}`, data);
    return res;
  },
};

export const useTaskMutation = () => {
  const queryClient = useQueryClient();

  const post = useMutation({
    ...taskMutationPostOptions,
    onError: () => {
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
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['overblik'],
      });
      //   toast.success('Færdiggjort');
    },
  });

  // const update = useMutation({
  //   ...taskMutationUpdate,
  //   onError: () => {
  //     toast.error('Noget gik galt');
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['overblik'],
  //     });
  //     //   toast.success('Opdateret');
  //   },
  // });

  const update = useMutation({
    mutationKey: ['task_mutation_update'],
    mutationFn: async (data: UpdateTask[]) => {
      const {data: out} = await apiClient.post<void>(`/sensor_admin/overblik/update_status`, data);
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['overblik'],
      });
    },
  });

  return {post, markAsDone, update};
};
