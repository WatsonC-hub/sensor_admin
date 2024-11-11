import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

import type {Task, PatchTask, DBTask} from '../types';

type Mutation<TData> = {
  path: string;
  data: TData;
};

interface TasksBase {
  path: string;
  data?: any;
}

type UpdateTask = {
  ts_id: number;
  notification_id: number;
  status?: string | null | undefined;
  enddate?: string | null | undefined;
  notify_type?: 'obs' | 'primary' | 'station' | null | undefined;
};

type TaskConvert = {
  ts_id: number;
  name: string;
  description?: string;
  status_id: number;
  due_date: string | null;
  assigned_to: string;
  notification_id: number;
};

export const tasksPostOptions = {
  mutationKey: ['tasks_post'],
  mutationFn: async (mutation_data: Mutation<DBTask>) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/`, data); /* Write the url for the endpoint  */
    return result;
  },
};
export const taskPatchOptions = {
  mutationKey: ['tasks_patch'],
  mutationFn: async (mutation_data: Mutation<PatchTask>) => {
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
  mutationFn: async (mutation_data: Mutation<any>) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/${path}`); /* Write the url for the endpoint  */
    return result;
  },
};

export const convertNotificationToTaskOptions = {
  mutationKey: ['tasks_convert'],
  mutationFn: async (data: TaskConvert) => {
    const {data: res} = await apiClient.post(`/sensor_admin/tasks/convert_notification`, data);
    return res;
  },
};

export const notificationUpdateStatus = {
  mutationKey: ['notification_update'],
  mutationFn: async (data: UpdateTask[]) => {
    const {data: res} = await apiClient.put<UpdateTask>(
      `/sensor_admin/overblik/update_status`,
      data
    );
    return res;
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
  const post = useMutation<unknown, APIError, Mutation<DBTask>>({
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

  const convertNotificationToTask = useMutation({
    ...convertNotificationToTaskOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['overblik'],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      toast.success('Opgave oprettet');
    },
  });

  const updateNotification = useMutation({
    ...notificationUpdateStatus,
    onSuccess: () => {
      toast.success('Opgave opdateret');
      queryClient.invalidateQueries({
        queryKey: ['overblik'],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
    },
  });

  return {get, post, patch, del, convertNotificationToTask, updateNotification};
};
