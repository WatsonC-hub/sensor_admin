import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';

import {apiClient} from '~/apiClient';
import {GraphData} from '~/types';

export const useGraphData = (ts_id: number | undefined, xRange: Array<string>) => {
  const x0 = dayjs(xRange[0]);
  const x1 = dayjs(xRange[1]);
  const daysdiff = x1.diff(x0, 'days');

  const start = x0.subtract(Math.max(daysdiff * 0.2, 1), 'days').format('YYYY-MM-DDTHH:mm');
  const end = x1.add(Math.max(daysdiff * 0.2, 1), 'days').format('YYYY-MM-DDTHH:mm');

  const query = useQuery({
    queryKey: ['graphData', ts_id, [start, end]],
    queryFn: async () => {
      const {data} = await apiClient.get<GraphData>(`/data/timeseriesV2/${ts_id}`, {
        params: {
          start: start,
          stop: end,
          limit: 4000,
        },
      });
      return data ?? [];
    },
    staleTime: 0,
    placeholderData: (prev, query) => {
      if (query?.queryKey[1] != ts_id) return undefined;
      return prev;
    },
    enabled: ts_id !== null && ts_id !== undefined,
  });

  return query;
};
