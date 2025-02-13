import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {useAppContext} from '~/state/contexts';

export const useMetadata = (ts_id?: number) => {
  const {ts_id: app_ts_id, loc_id} = useAppContext([], ['ts_id', 'loc_id']);

  const inner_ts_id = ts_id ?? app_ts_id;

  const get = useQuery({
    queryKey: ['metadata', inner_ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata/${inner_ts_id}`);
      return data;
    },
    enabled: inner_ts_id !== undefined,
    refetchOnWindowFocus: false,
  });

  const {data: location_data} = useQuery({
    queryKey: ['location_data', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
      return data;
    },
    enabled: loc_id !== undefined && inner_ts_id === undefined,
    refetchOnWindowFocus: false,
  });

  return {get, location_data};
};
