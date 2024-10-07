import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {QaGraphData} from '~/types';

export const useGraphData = (ts_id: number, xRange: Array<string>, useQA: boolean) => {
  const query = useQuery({
    queryKey: ['graphData', ts_id, xRange, useQA],
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
    enabled: useQA && ts_id !== null && ts_id !== undefined,
    // keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  return query;
};
