import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type NotificationType = {
  gid: number;
  name: string;
  flag: number;
  color: string;
};

const getNotificationTypes = queryOptions({
  queryKey: ['notificationTypes'],
  queryFn: async () => {
    const {data} = await apiClient.get<NotificationType[]>('/sensor_admin/notification-types');
    return data;
  },
});

const useNotificationType = () => {
  const get = useQuery(getNotificationTypes);

  return {
    get,
  };
};

export default useNotificationType;
