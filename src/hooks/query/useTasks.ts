import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import type {Notification} from '~/hooks/query/useNotificationOverview';
import {APIError} from '~/queryClient';
import {stamdataStore} from '~/state/store';

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

// {
//   "ts_id": 1987,
//   "opgave": "Kontrolmåling snart",
//   "gid": 7954,
//   "created_at": "2024-10-15T09:20:01.496464Z",
//   "blocks_notifications": [
//     6
//   ],
//   "description": "Test",
//   "flag": null,
//   "notify_type": null,
//   "done": true,
//   "due_date": null
// }

export type Task = {
  ts_id: number;
  opgave: string;
  gid: number;
  created_at: string;
  blocks_notifications: number[];
  description: string;
  flag: number | null;
  notify_type: 'obs' | 'primary' | 'station' | null;
  done: boolean;
  due_date: string | null;
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
  mutationFn: async (mutation_data: {path: string | number; data: {opgave: string}}) => {
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

export const convertNotificationToTaskOptions = {
  mutationKey: ['convert_notification_to_task'],
  mutationFn: async (data: Notification) => {
    const {data: res} = await apiClient.post(
      `/sensor_admin/task/convert_notification_to_task`,
      data
    );
    return res;
  },
};

export const useTasks = () => {
  const queryClient = useQueryClient();
  const ts_id = stamdataStore((store) => store.timeseries.ts_id);

  const get = useQuery<Task[], APIError>({
    queryKey: ['tasks', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Task[]>(`/sensor_admin/tasks/${ts_id}`);
      return data;
    },
  });

  const getAll = useQuery<Task[], APIError>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const {data} = await apiClient.get<Task[]>(`/sensor_admin/tasks`);
      return data;
    },
  });

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
      toast.success('Opgave oprettet');
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
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
      toast.success('Opgave færdiggjort');
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
      toast.success('Opgave opdateret');
      queryClient.invalidateQueries({
        queryKey: ['overblik'],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });
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

  return {get, getAll, post, markAsDone, update, convertNotificationToTask};
};
