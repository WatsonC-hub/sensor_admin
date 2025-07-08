import {useQuery, useMutation, useQueryClient, queryOptions} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
// import {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError} from '~/queryClient';

import {
  type Task,
  type PatchTask,
  type TaskUser,
  type TaskStatus,
  DBTask,
  DeleteTaskFromItinerary,
} from '../types';
import {useDisplayState} from '~/hooks/ui';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {invalidateFromMeta} from '~/helpers/InvalidationHelper';

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

const tasksPostOptions = {
  mutationKey: ['tasks_post'],
  mutationFn: async (mutation_data: PostTask) => {
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/`, mutation_data);
    return result;
  },
};
const taskPatchOptions = {
  mutationKey: ['tasks_patch'],
  mutationFn: async (mutation_data: Mutation<PatchTask>) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.patch(`/sensor_admin/tasks/${path}`, data);
    return result;
  },
};
const tasksDelOptions = {
  mutationKey: ['tasks_del'],
  mutationFn: async (mutation_data: Mutation<any>) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_admin/tasks/${path}`);
    return result;
  },
};

const convertNotificationToTaskOptions = {
  mutationKey: ['tasks_convert'],
  mutationFn: async (data: TaskConvert) => {
    const {data: res} = await apiClient.post(`/sensor_admin/tasks/convert_notification`, data);
    return res;
  },
};

const notificationUpdateStatus = {
  mutationKey: ['notification_update'],
  mutationFn: async (data: UpdateNotification[]) => {
    const {data: res} = await apiClient.post<UpdateNotification>(
      `/sensor_admin/overblik/update_status`,
      data
    );
    return res;
  },
};

const deleteTaskFromItineraryOptions = {
  mutationKey: ['taskItinerary_delete'],
  mutationFn: async (mutation_data: DeleteTaskFromItinerary) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_admin/tasks/itineraries/${path}`);
    return result;
  },
};

const getNextDueDateOptions = (ts_id: number, open: boolean) =>
  queryOptions<string, APIError>({
    queryKey: queryKeys.Tasks.nextDueDate(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks/next_due_date/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined && ts_id !== null && open,
  });

export const getNextDueDate = (ts_id: number, open: boolean) => {
  return useQuery(getNextDueDateOptions(ts_id, open));
};

const onMutateTasks = () => {
  return {
    meta: {
      invalidates: [queryKeys.Tasks.all(), queryKeys.Itineraries.all(), queryKeys.Map.all()],
    },
  };
};

const onPutTasks = (task_id: string) => {
  return {
    meta: {
      invalidates: [
        queryKeys.Tasks.taskHistory(task_id),
        queryKeys.Tasks.all(),
        queryKeys.Map.all(),
        queryKeys.Itineraries.all(),
        queryKeys.Timeseries.all(),
      ],
    },
  };
};

const onMutateItinerary = (itinerary_id: string) => {
  return {
    meta: {
      invalidates: [
        queryKeys.Itineraries.byId(itinerary_id),
        queryKeys.Itineraries.itineraryTasks(itinerary_id),
        queryKeys.Tasks.all(),
        queryKeys.Map.all(),
      ],
    },
  };
};

// /location_related_tasks/{loc_id}
export const useTasks = () => {
  const queryClient = useQueryClient();

  const [setSelectedTask] = useDisplayState((state) => [state.setSelectedTask]);

  const get = useQuery<Task[], APIError>({
    queryKey: queryKeys.Tasks.all(),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/tasks`);
      return data;
    },
    staleTime: 1000 * 60 * 1,
  });

  const post = useMutation({
    ...tasksPostOptions,
    onMutate: onMutateTasks,
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Opgaver gemt');
    },
  });

  const patch = useMutation<DBTask, APIError, Mutation<PatchTask>>({
    ...taskPatchOptions,
    onMutate: async (mutation_data) => {
      const {path, data} = mutation_data;
      const previous = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.invalidateQueries({queryKey: queryKeys.Tasks.all()});
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

        setSelectedTask(data.id);
      }
      const context = onPutTasks(data.id);
      invalidateFromMeta(queryClient, context.meta);
    },
    onError: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.Tasks.all()});
    },
  });
  const del = useMutation({
    ...tasksDelOptions,
    onMutate: () => onMutateTasks(),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);

      toast.success('Opgave slettet');
    },
  });

  const convertNotificationToTask = useMutation({
    ...convertNotificationToTaskOptions,
    onMutate: onMutateTasks,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
      toast.success('Opgave oprettet');
    },
  });

  const updateNotification = useMutation({
    ...notificationUpdateStatus,
    onMutate: () => onMutateTasks(),
    onSuccess: (data, variables, context) => {
      invalidateFromMeta(queryClient, context.meta);
    },
  });

  const getUsers = useQuery<TaskUser[], APIError>({
    queryKey: queryKeys.Tasks.taskUsers(),
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/task_users');

      return data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const getStatus = useQuery<TaskStatus[], APIError>({
    queryKey: queryKeys.Tasks.taskStatus(),
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/status');

      return data;
    },
    staleTime: 1000 * 60 * 60,
  });

  const deleteTaskFromItinerary = useMutation({
    ...deleteTaskFromItineraryOptions,
    onMutate: (variables) => {
      const {path} = variables;
      const splitted = path.split('/');
      const id = splitted[splitted.length - 1];
      return onMutateItinerary(id);
    },
    onSuccess: (data, variables, context) => {
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

      invalidateFromMeta(queryClient, context.meta);

      toast.success('Opgaver fjernet fra tur');
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
    // getProjects,
  };
};
