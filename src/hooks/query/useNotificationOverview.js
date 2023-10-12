import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

export const useNotificationOverview = (ts_id) => {
  const query = useQuery(
    ['overblik'],
    async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_admin/overblik`, {
        signal,
      });
      return data;
    },

    {
      staleTime: 1000 * 60 * 60 * 24,
    }
  );
  return query;
};
