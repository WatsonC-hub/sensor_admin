import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {QaAllData} from '~/types';

export const useAdjustmentData = (ts_id: number) => {
  const query = useQuery({
    queryKey: ['qa_all', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<QaAllData>(`/sensor_admin/qa_all/${ts_id}`);
      return data;
    },
    enabled: typeof ts_id == 'number',
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return query;
};
