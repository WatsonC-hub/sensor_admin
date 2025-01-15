import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError, GetQueryOptions} from '~/queryClient';

import {taskStore} from '../store';
import {type Task, type PatchTask, type TaskUser, type TaskStatus, DBTask} from '../types';

type Mutation<TData> = {
  path: string;
  data?: TData;
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
  block_all?: boolean;
  block_on_location?: boolean;
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

export const RelatedTasksOptions = <TData>(
  loc_ids: Array<number> | undefined
): GetQueryOptions<TData> => ({
  queryKey: ['tasks', loc_ids],
  queryFn: async () => {
    const {data} = await apiClient.get<TData>(`/sensor_admin/tasks/${loc_ids}`);
    console.log('from api', data);
    return data;
  },
  enabled: loc_ids !== undefined && loc_ids !== null && loc_ids.length > 0,
});

// /location_related_tasks/{loc_id}
export const useTasks = () => {
  const queryClient = useQueryClient();
  const setSelectedTask = taskStore((state) => state.setSelectedTask);
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

  const patch = useMutation<DBTask, APIError, Mutation<PatchTask>>({
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
    onSuccess: (data, variables) => {
      const {path} = variables;
      if (path != data.id) {
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

        queryClient.invalidateQueries({queryKey: ['overblik']});

        // queryClient.setQueryData<Notification[]>(['overblik'], (old) => {
        //   if (!old) {
        //     return [];
        //   }
        //   const idx = old.findIndex(
        //     (n) => n.notification_id === data.blocks_notifications[0] && n.ts_id === data.ts_id
        //   );

        //   const numberOfNotifications = old.filter((n) => n.ts_id === data.ts_id).length;

        //   if (idx != -1 && numberOfNotifications > 1) {
        //     old.splice(idx, 1);
        //   } else if (idx != -1) {
        //     old[idx].type = 'task';
        //   }
        //   return old;
        // });

        //TODO: change selected task to new ID
        setSelectedTask(data.id);
      }

      queryClient.invalidateQueries({
        queryKey: ['taskHistory', path],
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
      toast.success('Opgave slettet');
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
