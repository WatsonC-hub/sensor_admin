import {apiClient} from '~/apiClient';
import {MutateOptions, queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {useAppContext} from '~/state/contexts';
import {AlarmCriteriaType, AlarmHistory, AlarmPost, AlarmResponse, alarmTable} from '../types';
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

const alarmCriteriaGetOptions = (ts_id: number | undefined) => {
  return {
    queryKey: ['alarm_criteria', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<AlarmCriteriaType>>(
        `/sensor_field/stamdata/alarms/criteria`
      );
      return data;
    },
    enabled: !!ts_id,
  };
};

const alarmGetOptions = (ts_id: number | undefined) =>
  queryOptions({
    queryKey: ['alarm', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<AlarmResponse>>(
        `/sensor_field/stamdata/alarms/${ts_id}`
      );
      return data;
    },
    enabled: !!ts_id,
    select: (data) => {
      const transformedAlarm: alarmTable[] = data.map(
        (alarm) =>
          ({
            gid: alarm.gid,
            name: alarm.name,
            note_to_include: alarm.note_to_include,
            groups: [],
            alarm_notifications: alarm.alarm_notifications,
            alarm_contacts: alarm.alarm_contacts.map((contact) => ({
              contact_id: contact.contact_id,
              name: contact.name,
              sms: {
                sms: contact.sms,
                to: contact.sms_to,
                from: contact.sms_from,
              },
              email: {
                email: contact.email,
                to: contact.email_to,
                from: contact.email_from,
              },
              call: {
                call: contact.call,
                to: contact.call_to,
                from: contact.call_from,
              },
            })),
          }) as alarmTable
      );
      return transformedAlarm;
    },
  });

const AlarmHistoryGetOptions = (ts_id: number | undefined) =>
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

  const getCriteria = useQuery({
    ...alarmCriteriaGetOptions(ts_id),
  });

  return {
    get,
    getCriteria,
    getHistory,
    post: (data: AlarmsPost, options?: MutateOptions<any, Error, AlarmsPost, unknown>) =>
      post.mutate(data, options),
    put: (data: AlarmsPost, options?: MutateOptions<any, Error, AlarmsPost, unknown>) =>
      put.mutate(data, options),
    del: (data: AlarmBase, options?: MutateOptions<any, Error, AlarmBase, unknown>) =>
      del.mutate(data, options),
  };
};
