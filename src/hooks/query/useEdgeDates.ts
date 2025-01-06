import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';

type EdgeDates = {
  firstDate: string;
  lastDate: string;
};

export const useEdgeDates = (ts_id: number | undefined | null) => {
  const query = useQuery<EdgeDates | null, APIError>({
    queryKey: ['all_range', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<EdgeDates | null>(
        `/sensor_field/station/graph_all_range/${ts_id}`
      );

      return data;
    },
    staleTime: 10,
    enabled: ts_id !== undefined && ts_id !== null && ts_id !== -1,
  });

  return query;
};
