import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError, GetQueryOptions} from '~/queryClient';

import {taskStore} from '../store';
import {
  type Task,
  type PatchTask,
  type TaskUser,
  type TaskStatus,
  DBTask,
  DeleteTaskFromItinerary,
  MoveTaskToDifferentItinerary,
} from '../types';

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
    const {data: result} = await apiClient.delete(`/sensor_admin/tasks/${path}`);
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

export const deleteTaskFromItineraryOptions = {
  mutationKey: ['taskItinerary_delete'],
  mutationFn: async (mutation_data: DeleteTaskFromItinerary) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_admin/tasks/itineraries/${path}`);
    return result;
  },
};

export const moveTaskToItineraryOptions = {
  mutationKey: ['taskItinerary_move'],
  mutationFn: async (mutation_data: MoveTaskToDifferentItinerary) => {
    const {path, data} = mutation_data;
    console.log(data);
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/itineraries/${path}`, data);
    return result;
  },
};

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

  const deleteTaskFromItinerary = useMutation<unknown, APIError, DeleteTaskFromItinerary>({
    ...deleteTaskFromItineraryOptions,
    onSuccess: (data, variables) => {
      const {path} = variables;
      const splitted = path.split('/');
      const id = splitted[splitted.length - 1];
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(
        ['tasks'],
        previous?.map((task) => {
          if (task.id === id) {
            const updated = {...task, itinerary_id: null};

            return updated;
          }
          return task;
        })
      );
      queryClient.invalidateQueries({
        queryKey: ['itineraries', splitted[0]],
      });
    },
  });

  const moveTask = useMutation<unknown, APIError, MoveTaskToDifferentItinerary>({
    ...moveTaskToItineraryOptions,
    onSuccess: (_, variables) => {
      const {path, data} = variables;
      const task_itinerary_id = path;
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(
        ['tasks'],
        previous?.map((task) => {
          if (data.task_ids.includes(task.id)) {
            const updated = {...task, itinerary_id: task_itinerary_id};

            return updated;
          }
          return task;
        })
      );

      queryClient.invalidateQueries({
        queryKey: ['itineraries'],
      });

      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
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
    deleteTaskFromItinerary,
    moveTask,
    // getProjects,
  };
};
