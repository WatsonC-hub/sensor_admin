import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

import {type Task, type PatchTask, type DBTask, TaskUser, TaskStatus} from '../types';

type Mutation<TData> = {
  path: string;
  data: TData;
};

type UpdateTask = {
  ts_id: number;
  notification_id?: number;
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
  assigned_to: string | null;
  notification_id: number;
};

export const tasksPostOptions = {
  mutationKey: ['tasks_post'],
  mutationFn: async (mutation_data: Mutation<DBTask>) => {
    const {data} = mutation_data;
    const {data: result} = await apiClient.post(`/`, data);
    return result;
  },
};
export const taskPatchOptions = {
  mutationKey: ['tasks_patch'],
  mutationFn: async (mutation_data: Mutation<PatchTask>) => {
    const {path, data} = mutation_data;
    console.log(data);
    const {data: result} = await apiClient.patch(`/sensor_admin/tasks/${path}`, data);
    return result;
  },
};
export const tasksDelOptions = {
  mutationKey: ['tasks_del'],
  mutationFn: async (mutation_data: Mutation<any>) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/${path}`);
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
      return data;
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
  const patch = useMutation<unknown, APIError, Mutation<PatchTask>>({
    ...taskPatchOptions,
    onMutate: async (mutation_data) => {
      const {path, data} = mutation_data;
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(
        ['tasks'],
        previous?.map((task) => {
          if (task.id === path) {
            const updated = {...task, ...data};
            if ('assigned_to' in data) {
              const display_name = previous.find(
                (task) => task.assigned_to === data.assigned_to && task.assigned_display_name
              )?.assigned_display_name;
              updated.assigned_display_name = display_name ?? '';
            }

            return updated;
          }
          return task;
        })
      );
      return {previous};
    },
    onSuccess: (_, variables) => {
      const {path, data} = variables;
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      if ('assigned_to' in data) {
        const display_name = previous?.find(
          (task) => task.assigned_to === data.assigned_to && task.assigned_display_name
        )?.assigned_display_name;
        if (!display_name) {
          queryClient.invalidateQueries({
            queryKey: ['tasks'],
          });
        }
      }
      queryClient.invalidateQueries({
        queryKey: ['taskComments', path],
      });
      // toast.success('Opgaver ændret');
    },
    onError: (e) => {
      console.log(e);
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
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

  const getUsers = useQuery<TaskUser[], APIError>({
    queryKey: ['task_users'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/task_users');

      return data;
    },
  });

  const getStatus = useQuery<TaskStatus[], APIError>({
    queryKey: ['task_status'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/status');

      return data;
    },
  });

  return {
    get,
    post,
    patch,
    del,
    convertNotificationToTask,
    updateNotification,
    getUsers,
    getStatus,
  };
};
