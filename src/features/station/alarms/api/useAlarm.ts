import {apiClient} from '~/apiClient';
import {MutateOptions, queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {useAppContext} from '~/state/contexts';
import {AlarmPost, AlarmResponse} from '../types';
import {queryClient} from '~/queryClient';

interface AlarmBase {
  path: string;
}

interface AlarmsPost extends AlarmBase {
  data: AlarmPost;
}

const alarmPostOptions = {
  mutationKey: ['alarm_post'],
  mutationFn: async (mutation_data: AlarmsPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(`/sensor_field/stamdata/alarms/${path}`, data);
    return result;
  },
  onSuccess: () => {
    // Optionally handle success, e.g., show a toast notification
    queryClient.invalidateQueries({
      queryKey: ['alarm'],
    });
  },
};

const alarmPutOptions = {
  mutationKey: ['alarm_put'],
  mutationFn: async (mutation_data: AlarmsPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.put(`/sensor_field/stamdata/alarms/${path}`, data);
    return result;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['alarm'],
    });
  },
};

const alarmDelOptions = {
  mutationKey: ['alarm_del'],
  mutationFn: async (mutation_data: AlarmBase) => {
    const {path} = mutation_data;
    const {data: result} = await apiClient.delete(`/sensor_field/stamdata/alarms/${path}`);
    return result;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['alarm'],
    });
  },
};

export const alarmGetOptions = (ts_id: number | undefined) => {
  return {
    queryKey: ['alarm', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<AlarmResponse>>(
        `/sensor_field/stamdata/alarms/${ts_id}`
      );
      return data;
    },
    enabled: !!ts_id,
  };
};

export const AlarmHistoryGetOptions = (ts_id: number | undefined) =>
  queryOptions({
    queryKey: ['alarm_history', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<
        Array<{
          date: string;
          sent_type: string;
          alarm: boolean;
          alarm_low: boolean;
          name: string;
        }>
      >(`/sensor_field/stamdata/alarms/alarm_history/${ts_id}`);
      return data;
    },
    enabled: !!ts_id,
  });

export const useAlarm = () => {
  const {ts_id} = useAppContext(['ts_id']);

  const get = useQuery({
    ...alarmGetOptions(ts_id),
  });

  const getHistory = useQuery(AlarmHistoryGetOptions(ts_id));

  const post = useMutation({
    ...alarmPostOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['alarm', ts_id],
      });
    },
  });
  const put = useMutation({
    ...alarmPutOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['alarm', ts_id],
      });
    },
  });
  const del = useMutation({
    ...alarmDelOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['alarm', ts_id],
      });
    },
  });

  return {
    get,
    getHistory,
    post: (data: AlarmsPost, options?: MutateOptions<any, Error, AlarmsPost, unknown>) =>
      post.mutate(data, options),
    put: (data: AlarmsPost, options?: MutateOptions<any, Error, AlarmsPost, unknown>) =>
      put.mutate(data, options),
    del: (data: AlarmBase, options?: MutateOptions<any, Error, AlarmBase, unknown>) =>
      del.mutate(data, options),
  };
};
