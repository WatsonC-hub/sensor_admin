import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {QaGraphData} from '~/types';

export const useGraphData = (ts_id: number, xRange: Array<string>) => {
  const query = useQuery({
    queryKey: ['graphData', ts_id, xRange],
    queryFn: async () => {
      const {data} = await apiClient.get<QaGraphData>(`/data/timeseriesV2/${ts_id}`, {
        params: {
          start: xRange[0],
          stop: xRange[1],
          limit: 4000,
        },
      });
      return data ?? [];
    },
    placeholderData: (prev) => prev,
    enabled: ts_id !== null && ts_id !== undefined,
    refetchOnWindowFocus: false,
  });

  return query;
};
