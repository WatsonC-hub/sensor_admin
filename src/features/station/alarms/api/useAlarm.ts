import {apiClient} from '~/apiClient';
import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {useAppContext} from '~/state/contexts';
import {AlarmNotificationType, AlarmHistory, AlarmTableType} from '../types';
import {APIError, queryClient} from '~/queryClient';
import {AlarmsFormValues} from '../schema';

interface AlarmBase {
  path: string;
}

interface AlarmsPost extends AlarmBase {
  data: AlarmsFormValues;
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

const alarmNotificationGetOptions = {
  queryKey: ['alarm_notification'],
  queryFn: async () => {
    const {data} = await apiClient.get<Array<AlarmNotificationType>>(
      `/sensor_field/stamdata/alarms/notification`
    );
    return data;
  },
};

export const alarmGetOptions = (ts_id: number | undefined) =>
  queryOptions<Array<AlarmTableType>, APIError>({
    queryKey: ['alarm', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/alarms/${ts_id}`);
      return data;
    },
    enabled: !!ts_id,
  });

const alarmHistoryGetOptions = (ts_id: number | undefined) =>
  queryOptions({
    queryKey: ['alarm_history', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<AlarmHistory>>(
        `/sensor_field/stamdata/alarms/alarm_history/${ts_id}`
      );
      return data;
    },
    enabled: !!ts_id,
  });

export const useAlarm = () => {
  const {ts_id} = useAppContext(['ts_id']);

  const get = useQuery({
    ...alarmGetOptions(ts_id),
  });

  const getHistory = useQuery(alarmHistoryGetOptions(ts_id));

  const post = useMutation({
    ...alarmPostOptions,
    meta: {
      invalidates: [['alarm']],
    },
  });
  const put = useMutation({
    ...alarmPutOptions,
    meta: {
      invalidates: [['alarm']],
    },
  });
  const del = useMutation({
    ...alarmDelOptions,
    meta: {
      invalidates: [['alarm']],
    },
  });

  const getAlarmNotification = useQuery({
    ...alarmNotificationGetOptions,
  });

  return {
    get,
    getAlarmNotification,
    getHistory,
    post,
    put,
    del,
  };
};
