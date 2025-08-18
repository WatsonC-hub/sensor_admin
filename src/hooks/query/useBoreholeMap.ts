import {useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {BoreholeMapData} from '~/types';

export const useBoreholeMap = () => {
  const user = useUser();

  const query = useQuery<BoreholeMapData[]>({
    queryKey: ['borehole_map'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole_map`);
      return data;
    },
    staleTime: 10 * 1000,
    enabled: user?.features.boreholeAccess,
  });
  return query;
};
