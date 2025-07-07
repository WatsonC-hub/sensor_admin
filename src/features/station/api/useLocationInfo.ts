import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {Group} from '~/types';

type LocationInfo = {
  loc_name: string;
  groups: Group[];
  customer_name: string;
  project_info: string;
  projectno: string;
  loctype_name: string;
  x: number;
  y: number;
  ressources: string[];
};

export const locationInfoOptions = (loc_id: number) =>
  queryOptions<LocationInfo>({
    queryKey: queryKeys.Location.info(loc_id),
    queryFn: async () => {
      const {data} = await apiClient.get<LocationInfo>(
        `/sensor_field/stamdata/location_data/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined,
  });

export const useLocationInfo = (loc_id: number) => {
  const user = useUser();
  return useQuery({
    ...locationInfoOptions(loc_id),
    enabled: user?.features?.iotAccess && loc_id !== undefined,
  });
};
