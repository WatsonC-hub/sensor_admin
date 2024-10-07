import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {PejlingItem} from '~/types';

export const useControlData = (ts_id: number) => {
  const query = useQuery({
    queryKey: ['controls', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<PejlingItem>>(
        `/sensor_field/station/measurements/${ts_id}?useReference=true`
      );
      return data;
    },
    enabled: ts_id !== null && ts_id !== undefined,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return query;
};
