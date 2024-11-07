import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

import type {Task, PatchTask, DBTask} from '../types';

interface TasksBase {
  path: string;
  data?: any;
}
interface TasksPost extends TasksBase {
  data: DBTask;
}

interface TasksPatch extends TasksBase {
  data: PatchTask;
}
export const tasksPostOptions = {
  mutationKey: ['tasks_post'],
  mutationFn: async (mutation_data: TasksPost) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/`, data); /* Write the url for the endpoint  */
    return result;
  },
};
export const taskPatchOptions = {
  mutationKey: ['tasks_patch'],
  mutationFn: async (mutation_data: TasksPatch) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.patch(
      `/${path}`,
      data
    ); /* Write the url for the endpoint  */
    return result;
  },
};
export const tasksDelOptions = {
  mutationKey: ['tasks_del'],
  mutationFn: async (mutation_data: TasksBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/${path}`); /* Write the url for the endpoint  */
    return result;
  },
};

export const useTasks = () => {
  const queryClient = useQueryClient();
  const get = useQuery<Task[], APIError>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/');
      return data; /* Write the url for the endpoint  */
    },
    initialData: [],
  });
  const post = useMutation<unknown, APIError, TasksPost>({
    ...tasksPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      toast.success('Opgaver gemt');
    },
  });
  const patch = useMutation({
    ...taskPatchOptions,
    onMutate: async (mutation_data) => {
      const {path, data} = mutation_data;
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(
        ['tasks'],
        previous?.map((task) => {
          if (task.id === path) {
            const newTask = {...task};

            if (data.assigned_to) {
              newTask.assigned_to = data.assigned_to;
            }
            if (data.due_date) {
              newTask.due_date = data.due_date;
            }
            if (data.status_id) {
              newTask.status_id = data.status_id;
            }
            if (data.name) {
              newTask.name = data.name;
            }
            if (data.description) {
              newTask.description = data.description;
            }
            return newTask;
          }
          return task;
        })
      );
      return {previous};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      toast.success('Opgaver ændret');
    },
  });
  const del = useMutation({
    ...tasksDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      toast.success('Opgaver slettet');
    },
  });
  return {get, post, patch, del};
};
