import {useQuery, useQueryClient} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

export const useGraphData = (ts_id, xRange) => {
  const query = useQuery(
    ['graphData', ts_id, xRange],
    async ({signal}) => {
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
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    }
  );

  return query;
};
