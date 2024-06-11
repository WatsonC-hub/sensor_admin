import {UseQueryResult, useQuery, type UseQueryOptions} from '@tanstack/react-query';
import {reverse, sortBy} from 'lodash';

import {apiClient} from '~/apiClient';

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
  opgave: string;
  dato: string;
  color: string;
  flag: number;
  notification_id: number;
  status: string | null;
  enddate: string | null;
  projectno: string;
  is_customer_service: boolean;
  active: boolean;
}

export interface NotificationMap extends Notification {
  otherNotifications: Notification[];
}

type NotificationOverviewOptions = Partial<
  Omit<UseQueryOptions<Notification[]>, 'queryKey' | 'queryFn'>
>;

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
      console.log('len data', data.length);
      const sorted = reverse(
        sortBy(data, [(item) => (item.status ? item.status : ''), (item) => item.flag])
      );

      const grouped = sorted.reduce((acc: NotificationMap[], item: Notification) => {
        const existing = acc.find((accItem) => accItem.locid === item.locid);
        if (existing) {
          existing.otherNotifications.push(item);
          existing.active = existing.active || item.active;
        } else {
          acc.push({...item, otherNotifications: []});
        }
        return acc;
      }, []);

      console.log('len grouped', grouped.length);
      return grouped;
    },
  });
};
