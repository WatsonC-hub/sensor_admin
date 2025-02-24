import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {addValueToDate, dateDiff, subtractFromDate} from '~/helpers/dateConverter';
import {GraphData} from '~/types';

export const useGraphData = (ts_id: number | undefined, xRange: Array<string>) => {
  const x0 = xRange[0];
  const x1 = xRange[1];
  const daysdiff = dateDiff(x1, x0, 'days');

  const start = subtractFromDate(x0, Math.max(daysdiff * 0.2, 1), 'days').format(
    'YYYY-MM-DDTHH:mm'
  );
  const end = addValueToDate(x1, Math.max(daysdiff * 0.2, 1), 'days').format('YYYY-MM-DDTHH:mm');

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
    placeholderData: (prev, query) => {
      if (query?.queryKey[1] != ts_id) return undefined;
      return prev;
    },
    enabled: ts_id !== null && ts_id !== undefined,
  });

  return query;
};
