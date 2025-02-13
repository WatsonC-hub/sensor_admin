import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {useAppContext} from '~/state/contexts';

export const useMetadata = (ts_id?: number) => {
  const {ts_id: app_ts_id, loc_id} = useAppContext([], ['ts_id', 'loc_id']);

  const inner_ts_id = ts_id ?? app_ts_id;

  let metadata = undefined;
  let error = undefined;
  let pending = undefined;

  const {
    data,
    error: error2,
    isPending: pending2,
  } = useQuery({
    queryKey: ['metadata', inner_ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata/${inner_ts_id}`);
      return data;
    },
    enabled: inner_ts_id !== undefined,
    refetchOnWindowFocus: false,
  });

  const {
    data: data2,
    error: error3,
    isPending: pending3,
  } = useQuery({
    queryKey: ['location_data', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
      return data;
    },
    enabled: loc_id !== undefined && inner_ts_id === undefined,
    refetchOnWindowFocus: false,
  });

  metadata = data ?? (data2 && data2[0]) ?? data2;
  error = error2 ?? error3;
  pending = data ? pending2 : pending3;

  return {metadata, error, pending};
};
