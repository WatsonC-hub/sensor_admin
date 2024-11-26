import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

import {type Task, type PatchTask, type TaskUser, type TaskStatus} from '../types';

type Mutation<TData> = {
  path: string;
  data: TData;
};

type UpdateNotification = {
  ts_id: number;
  notification_id?: number;
  status?: string | null | undefined;
  enddate?: string | null | undefined;
  notify_type?: 'obs' | 'primary' | 'station' | null | undefined;
};

type TaskConvert = {
  ts_id: number;
  name: string;
  description?: string | null;
  status_id?: number | null;
  due_date?: string | null;
  assigned_to?: string | null;
  notification_id: number;
  blockall?: boolean;
};

type PostTask = Omit<TaskConvert, 'notification_id'>;

export const tasksPostOptions = {
  mutationKey: ['tasks_post'],
  mutationFn: async (mutation_data: PostTask) => {
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/`, mutation_data);
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
  mutationFn: async (data: UpdateNotification[]) => {
    const {data: res} = await apiClient.post<UpdateNotification>(
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
    staleTime: 1000 * 60 * 5,
  });
  const post = useMutation<unknown, APIError, PostTask>({
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

            return updated;
          }
          return task;
        })
      );
      return {previous};
    },
    onSuccess: (_, variables) => {
      const {path} = variables;
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
    staleTime: 1000 * 60 * 5,
  });

  const getStatus = useQuery<TaskStatus[], APIError>({
    queryKey: ['task_status'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/status');

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // const getProjects = useQuery<TaskProject[], APIError>({
  //   queryKey: ['task_projects'],
  //   queryFn: async () => {
  //     const {data} = await apiClient.get('/sensor_admin/tasks/projects');

  //     return data;
  //   },
  //   staleTime: 1000 * 60 * 5,
  // });

  return {
    get,
    post,
    patch,
    del,
    convertNotificationToTask,
    updateNotification,
    getUsers,
    getStatus,
    // getProjects,
  };
};
