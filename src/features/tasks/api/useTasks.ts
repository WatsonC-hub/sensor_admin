import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

import {dummydata} from '../consts';
import type {Task} from '../types';

interface TasksBase {
  path: string;
  data?: any;
}
interface TasksPost extends TasksBase {
  data: object;
}
interface TasksPut extends TasksBase {
  data: object;
}
export const tasksPostOptions = {
  mutationKey: ['tasks_post'],
  mutationFn: async (mutation_data: TasksPost) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/`, data); /* Write the url for the endpoint  */
    return result;
  },
};
export const tasksPutOptions = {
  mutationKey: ['tasks_put'],
  mutationFn: async (mutation_data: TasksPut) => {
    const {path, data} = mutation_data;
    console.log('path', path, 'data', data);
    const {data: result} = await apiClient.put(
      `//${path}`,
      data
    ); /* Write the url for the endpoint  */
    return result;
  },
};
export const tasksDelOptions = {
  mutationKey: ['tasks_del'],
  mutationFn: async (mutation_data: TasksBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(
      `//${path}`
    ); /* Write the url for the endpoint  */
    return result;
  },
};

export const useTasks = () => {
  const queryClient = useQueryClient();
  const get = useQuery<Task[], APIError>({
    queryKey: ['tasks'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return [...dummydata]; /* Write the url for the endpoint  */
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
  const put = useMutation({
    ...tasksPutOptions,
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
  return {get, post, put, del};
};
