import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';

export const useMetadata = (ts_id: number) => {
  const get = useQuery({
    queryKey: ['metadata', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined && ts_id !== -1,
    refetchOnWindowFocus: false,
  });

  return get;
};
