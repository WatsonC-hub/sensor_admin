import {UseQueryResult, queryOptions, useQuery, type UseQueryOptions} from '@tanstack/react-query';
import {sortBy} from 'lodash';

import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {FlagEnum, NotificationIDEnum} from '~/features/notifications/consts';
import {Group} from '~/types';

export interface Notification {
  loc_name: string;
  loc_id: number;
  ts_name: string;
  ts_id: number;
  x: number;
  y: number;
  longitude: number;
  latitude: number;
  terminalid: string;
  opgave: string | null;
  dato: string | null;
  color: string | null;
  flag: FlagEnum;
  notification_id: NotificationIDEnum;
  status: 'SCHEDULED' | 'POSTPONED' | 'IGNORED' | null;
  enddate: string | null;
  projectno: string | null;
  is_customer_service: boolean;
  active: boolean | null;
  notify_type: 'primary' | 'obs' | 'station' | null;
  isqa: boolean;
  groups: Group[];
  loctype_id: number;
  calculated: boolean | null;
  type: 'task' | 'notification' | 'itinerary' | 'none';
  parking_id: number;
  calypso_id: number | null;
}

export interface NotificationMap extends Notification {
  otherNotifications: Notification[];
  obsNotifications: Notification[];
}

type NotificationOverviewOptions = Partial<
  Omit<UseQueryOptions<Notification[]>, 'queryKey' | 'queryFn'>
>;

const sortByType = (item: Notification) => {
  switch (item.type) {
    case 'notification':
      return 0;
    case 'task':
      return 2;
    case 'itinerary':
      return 1;
    default:
      return 3;
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

// const tmpGetFlag = (item: Notification) => {
//   if (item.notify_type === 'obs' && item.notification_id === 42) {
//     return 2;
//   } else if ([141, 171].includes(item.notification_id)) {
//     return 2;
//   } else if ([12].includes(item.notification_id)) {
//     return 3;
//   } else {
//     return item.flag;
//   }
// };

// const tempNotificationTransform = (data: Notification[]): Notification[] => {
//   return data.map((item) => {
//     return {
//       ...item,
//       notify_type: 'primary',
//       flag: tmpGetFlag(item),
//     };
//   });
// };

export const useNotificationOverview = (options?: NotificationOverviewOptions) => {
  const user = useUser();
  const query = useQuery<Notification[]>({
    queryKey: ['overblik'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`);

      return data;
    },
    refetchInterval: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    staleTime: 10 * 1000,
    enabled: user?.features?.iotAccess,
    ...options,
  });
  return query;
};

export const useLocationNotificationOverview = (loc_id: number | undefined) => {
  return useQuery<Notification[]>({
    queryKey: ['overblik', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/overblik/${loc_id}`);
      return data;
    },
    staleTime: 10,
    enabled: loc_id !== undefined && loc_id !== -1,
  });
};

export const useNotificationOverviewMap = (
  options?: NotificationOverviewOptions
): UseQueryResult<NotificationMap[], Error> => {
  // @ts-expect-error - This is a valid use case for the hook
  return useNotificationOverview({
    select: (data) => {
      const sorted = sortBy(data, [
        sortByType,
        (item) => -item.flag,
        (item) => (item.projectno ? item.projectno : ''),
      ]);

      const grouped = sorted.reduce((acc: NotificationMap[], item: Notification) => {
        const existing = acc.find((accItem) => accItem.loc_id === item.loc_id);

        if (existing) {
          // if (item.type === 'task') {
          //   existing.type = 'task';
          // }
          // if (item.type === 'notification' && existing.type !== 'task') {
          //   existing.type = 'notification';
          // }

          if (item.notify_type === 'obs') {
            existing.obsNotifications.push(item);
          }
          existing.otherNotifications.push(item);

          if (existing.active == null) {
            existing.active = item.active;
          } else {
            existing.active = item.active || existing.active;
          }
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
    ...options,
  });
};

export interface MapOverview {
  loc_id: number;
  loc_name: string;
  longitude: number;
  latitude: number;
  loctype_id: number;
  parking_id: number | null;
  itinerary_id: string | null;
  no_unit: boolean;
  inactive: boolean | null;
  is_customer_service: boolean | null;
  projectno: string | null;
  has_task: boolean;
  groups: Group[];
  flag: FlagEnum | null;
  notification_id: NotificationIDEnum | null;
  due_date: string | null;
  notification_ids: NotificationIDEnum[] | null;
  mapicontype: 'notification' | 'task' | 'trip';
}

const mapOverviewOptions = queryOptions<MapOverview[]>({
  queryKey: ['map'],
  queryFn: async () => {
    const {data} = await apiClient.get<MapOverview[]>(`/sensor_field/map_data`);
    return data;
  },
  refetchInterval: 1000 * 60 * 60,
});

type MapOverviewOptions<T> = Partial<
  Omit<UseQueryOptions<MapOverview[], Error, T>, 'queryKey' | 'queryFn'>
>;

export const useMapOverview = <T = MapOverview[]>(options?: MapOverviewOptions<T>) => {
  const user = useUser();

  return useQuery({
    ...mapOverviewOptions,
    ...options,
    select: options?.select as (data: MapOverview[]) => T,
    enabled: user?.features?.iotAccess,
  });
};

export interface TimeseriesStatus {
  ts_id: number;
  loc_id: number;
  parameter: string;
  prefix: string | null;
  is_calculated: boolean;
  notification_id: NotificationIDEnum | null;
  flag: FlagEnum | null;
  opgave: string | null;
  has_task: boolean;
  due_date: string | null;
  no_unit: boolean;
  inactive: boolean | null;
  projectno: string | null;
  is_customer_service: boolean | null;
}

export const timeseriesStatusOptions = (loc_id: number) =>
  queryOptions({
    queryKey: ['timeseries', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<TimeseriesStatus[]>(
        `/sensor_field/timeseries_status/${loc_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 1,
  });

export const useTimeseriesStatus = (loc_id: number) => {
  const user = useUser();
  return useQuery({
    ...timeseriesStatusOptions(loc_id),
    enabled: user?.features?.iotAccess,
  });
};

type NotificationType = {
  gid: number;
  name: string;
  flag: FlagEnum;
};

export const useNotificationTypes = () => {
  return useQuery({
    queryKey: ['notification_types'],
    queryFn: async () => {
      const {data} = await apiClient.get<NotificationType[]>('/sensor_admin/notification-types');
      return data;
    },
    staleTime: 1000 * 60 * 15,
  });
};
