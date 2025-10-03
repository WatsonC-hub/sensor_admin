import {queryOptions, useQuery, type UseQueryOptions} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';

import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {FlagEnum, NotificationIDEnum} from '~/features/notifications/consts';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {Group} from '~/types';

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
  due_date: Dayjs | null;
  notification_ids: NotificationIDEnum[] | null;
  mapicontype: 'notification' | 'task' | 'trip';
}

const mapOverviewOptions = queryOptions<MapOverview[]>({
  queryKey: queryKeys.Map.all(),
  queryFn: async () => {
    const {data} = await apiClient.get<MapOverview[]>(`/sensor_field/map_data`);
    return data;
  },
  staleTime: 30 * 1000, // Data is fresh for 30 seconds
  refetchInterval: 60 * 1000, // Background refresh every 1 min
  refetchOnWindowFocus: false,
  refetchOnMount: false,
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

interface TimeseriesStatus {
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
    queryKey: queryKeys.Location.timeseries_status(loc_id),
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
    queryKey: queryKeys.notificationTypes(),
    queryFn: async () => {
      const {data} = await apiClient.get<NotificationType[]>('/sensor_admin/notification-types');
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
};
