import {useQuery} from '@tanstack/react-query';
import {queryOptions} from 'node_modules/@tanstack/react-query/build/modern/queryOptions';
import {apiClient} from '~/apiClient';
import {CriteriaTable} from '~/features/station/alarms/types';
import {ContactTable} from '~/types';

export type Alarm = {
  gid: number;
  name: string;
  alarm_interval: number;
  earliest_timeofday: string;
  latest_timeofday: string;
  note_to_include?: string;
  signal_warning: boolean;
  criteria: Array<CriteriaTable>;
  contacts: Array<ContactTable>;
};

const alarmGetOptions = queryOptions({
  queryKey: ['lookup_alarms'],
  queryFn: async () => {
    const {data} = await apiClient.get<Array<Alarm>>('/overview/alarms');

    return data;
  },
});

const useAlarms = () => {
  const get = useQuery(alarmGetOptions);

  return {
    get,
  };
};

export default useAlarms;
