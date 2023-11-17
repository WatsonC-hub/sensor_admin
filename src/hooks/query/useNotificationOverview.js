import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

export const useNotificationOverview = () => {
  const query = useQuery(
    ['overblik'],
    async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`, {
        signal,
      });
      return data;
    },
    {
      refetchOnReconnect: false,
      refetchInterval: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    }
  );
  return query;
};
