import {useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export const useGraphData = (ts_id, xRange) => {
  const query = useQuery({
    queryKey: ['graphData', ts_id, xRange],
    queryFn: async ({signal}) => {
      const {data} = await apiClient.get(`/data/timeseriesV2/${ts_id}`, {
        params: {
          start: xRange[0],
          stop: xRange[1],
          limit: 4000,
        },
      });
      if (data === null) {
        return [];
      }
      return data;
    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  return query;
};
