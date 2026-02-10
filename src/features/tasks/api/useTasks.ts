import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
  MutationOptions,
} from '@tanstack/react-query';
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
  TaskAPI,
} from '../types';
import {useDisplayState} from '~/hooks/ui';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import dayjs, {Dayjs} from 'dayjs';
import {useUser} from '~/features/auth/useUser';

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

type PostTask = Omit<TaskConvert, 'notification_id' | 'due_date'> & {
  due_date?: string | null;
};

const tasksPostOptions = {
  mutationKey: ['tasks_post'],
  mutationFn: async (mutation_data: PostTask) => {
    const {data: result} = await apiClient.post(`/sensor_admin/tasks/`, mutation_data);
    return result;
  },
};
const taskPatchOptions: MutationOptions<DBTask, APIError, Mutation<PatchTask>> = {
  mutationKey: ['tasks_patch'],
  mutationFn: async (mutation_data) => {
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

const getNextDueDateOptions = (ts_id: number | undefined) =>
  queryOptions<string, APIError, Dayjs>({
    queryKey: queryKeys.Tasks.nextDueDate(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<string>(`/sensor_admin/tasks/next_due_date/${ts_id}`);
      return data;
    },
    select: (data): Dayjs => {
      return dayjs(data);
    },
    enabled: ts_id !== undefined && ts_id !== null,
  });

export const useNextDueDate = (ts_id: number | undefined) => {
  return useQuery(getNextDueDateOptions(ts_id));
};

// /location_related_tasks/{loc_id}
export const useTasks = () => {
  const queryClient = useQueryClient();

  const [setSelectedTask] = useDisplayState((state) => [state.setSelectedTask]);
  const {
    features: {iotAccess},
    simpleTaskPermission,
  } = useUser();

  const get = useQuery<Task[], APIError, Task[]>({
    queryKey: queryKeys.Tasks.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<TaskAPI>>(`/sensor_admin/tasks`);

      return data.map((task) => ({
        ...task,
        due_date: task.due_date ? dayjs(task.due_date) : null,
        sla: task.sla ? dayjs(task.sla) : null,
      }));
    },

    staleTime: 1000 * 60 * 1, // 1 minute
  });

  const post = useMutation({
    ...tasksPostOptions,
    onSuccess: () => {
      toast.success('Opgaver gemt');
    },
  });

  const patch = useMutation<DBTask, APIError, Mutation<PatchTask>>({
    ...taskPatchOptions,
    onMutate: async (mutation_data) => {
      const {path, data} = mutation_data;
      const previous = queryClient.getQueryData<Task[]>(queryKeys.Tasks.all());
      queryClient.setQueryData<Task[]>(
        queryKeys.Tasks.all(),
        previous?.map((task) => {
          if (task.id === path) {
            const updated = {
              ...task,
              ...data,
              due_date: data?.due_date ? dayjs(data.due_date) : null,
            };
            return updated;
          }

          return task;
        })
      );
    },
    onSuccess: (data, variables) => {
      const {path} = variables;
      if (path != data.id) {
        const previous = queryClient.getQueryData<Task[]>(queryKeys.Tasks.all());
        queryClient.setQueryData<Task[]>(
          queryKeys.Tasks.all(),
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
    },
    onError: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.Tasks.all()});
    },
  });
  const del = useMutation({
    ...tasksDelOptions,
    onSuccess: () => {
      toast.success('Opgave slettet');
    },
  });

  const convertNotificationToTask = useMutation({
    ...convertNotificationToTaskOptions,
    onError: () => {
      toast.error('Noget gik galt');
    },
    onSuccess: () => {
      toast.success('Opgave oprettet');
    },
  });

  const updateNotification = useMutation({
    ...notificationUpdateStatus,
    onSuccess: () => {},
  });

  const getUsers = useQuery<TaskUser[], APIError>({
    queryKey: queryKeys.Tasks.taskUsers(),
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/task_users');

      return data;
    },
    staleTime: 1000 * 60 * 60,
    enabled: simpleTaskPermission && iotAccess,
  });

  const getStatus = useQuery<TaskStatus[], APIError>({
    queryKey: queryKeys.Tasks.taskStatus(),
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/status');

      return data;
    },
    staleTime: 1000 * 60 * 60,
    enabled: simpleTaskPermission && iotAccess,
  });

  const deleteTaskFromItinerary = useMutation({
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
