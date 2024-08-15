import {UseQueryResult, useQuery, type UseQueryOptions} from '@tanstack/react-query';
import {reverse, sortBy} from 'lodash';

import {apiClient} from '~/apiClient';
import {Group} from '~/types';

export interface Notification {
  locname: string;
  locid: number;
  stationname: string;
  stationid: number;
  x: number;
  y: number;
  longitude: number;
  latitude: number;
  terminalid: string;
  opgave: string | null;
  dato: string | null;
  color: string | null;
  flag: number;
  notification_id: number;
  status: 'SCHEDULED' | 'POSTPONED' | 'IGNORED' | null;
  enddate: string | null;
  projectno: string;
  is_customer_service: boolean;
  active: boolean;
  notify_type: 'primary' | 'obs' | 'station' | null;
  groups: Group[];
}

export interface NotificationMap extends Notification {
  otherNotifications: Notification[];
  obsNotifications: Notification[];
}

type NotificationOverviewOptions = Partial<
  Omit<UseQueryOptions<Notification[]>, 'queryKey' | 'queryFn'>
>;

const sortByNotifyType = (item: Notification) => {
  switch (item.notify_type) {
    case 'primary':
      return 3;
    case 'obs':
      return 2;
    case 'station':
      return 1;
    default:
      return 0;
  }
};

const nullState: Partial<Notification> = {
  opgave: null,
  dato: null,
  color: null,
  flag: 0,
  notification_id: 0,
  status: null,
  enddate: null,
  notify_type: null,
};

export const useNotificationOverview = (options?: NotificationOverviewOptions) => {
  const query = useQuery<Notification[]>({
    queryKey: ['overblik'],
    queryFn: async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`, {
        signal,
      });
      return data;
    },
    refetchOnReconnect: false,
    refetchInterval: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    staleTime: 10,
    ...options,
  });
  return query;
};

export const useNotificationOverviewMap = (
  options?: NotificationOverviewOptions
): UseQueryResult<NotificationMap[], Error> => {
  // @ts-expect-error - This is a valid use case for the hook
  return useNotificationOverview({
    ...options,
    select: (data) => {
      const sorted = reverse(
        sortBy(data, [
          sortByNotifyType,
          (item) => (item.status ? item.status : ''),
          (item) => item.flag,
        ])
      );

      const grouped = sorted.reduce((acc: NotificationMap[], item: Notification) => {
        const existing = acc.find((accItem) => accItem.locid === item.locid);

        if (existing) {
          if (item.notify_type === 'obs') {
            existing.obsNotifications.push(item);
          }
          existing.otherNotifications.push(item);

          existing.active = existing.active || item.active;
        } else {
          if (item.notify_type === 'primary') {
            acc.push({...item, otherNotifications: [], obsNotifications: []});
          } else if (item.notify_type === 'obs') {
            acc.push({...item, ...nullState, otherNotifications: [item], obsNotifications: [item]});
          } else {
            acc.push({...item, ...nullState, otherNotifications: [item], obsNotifications: []});
          }
        }
        return acc;
      }, []);

      return grouped;
    },
  });
};
