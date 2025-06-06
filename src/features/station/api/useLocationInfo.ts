import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {withPermissionGuard} from '~/hooks/withPermissionGuard';
import {Group} from '~/types';

type LocationInfo = {
  loc_name: string;
  groups: Group[];
  customer_name: string;
  project_info: string;
  projectno: string;
  loctype_name: string;
};

export const locationInfoOptions = (loc_id: number | undefined) =>
  queryOptions<LocationInfo>({
    queryKey: ['location_info', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<LocationInfo>(
        `/sensor_field/stamdata/location_data/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined,
  });

const useLocationInfo = (loc_id: number | undefined) => {
  return useQuery(locationInfoOptions(loc_id));
};

export const useGuardedUseLocationInfo = withPermissionGuard(useLocationInfo, 'features', [
  'iotAccess',
]);
