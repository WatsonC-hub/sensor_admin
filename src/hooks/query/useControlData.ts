import {useQuery} from '@tanstack/react-query';
import {useContext} from 'react';

import {apiClient} from '~/apiClient';

export const useControlData = (ts_id: number) => {
  const query = useQuery({
    queryKey: ['controls', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/station/measurements/${ts_id}?useReference=true`
      );
      return data;
    },
    enabled: typeof ts_id == 'number',
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return query;
};
