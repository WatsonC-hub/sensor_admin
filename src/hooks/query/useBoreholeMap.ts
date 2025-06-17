import {useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {BoreholeMapData} from '~/types';
import {withPermissionGuard} from '../withPermissionGuard';

// type Options = Partial<Omit<UseQueryOptions<BoreholeMapData[]>, 'queryKey' | 'queryFn'>>;

export const useBoreholeMap = <TData = BoreholeMapData[]>(
  select?: (data: BoreholeMapData[]) => TData
) => {
  const {
    features: {boreholeAccess},
  } = useUser();

  const query = useQuery({
    queryKey: ['borehole_map'],
    queryFn: async () => {
      const {data} = await apiClient.get<BoreholeMapData[]>(`/sensor_field/borehole_map`);
      return data;
    },
    staleTime: 10 * 1000,
    enabled: boreholeAccess,
    select,
  });
  return query;
};

export const useGuardedBoreholeMap = withPermissionGuard(useBoreholeMap, 'features', [
  'boreholeAccess',
]);
