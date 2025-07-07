import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {QaAllData} from '~/types';

export const useAdjustmentData = (ts_id: number) => {
  const query = useQuery({
    queryKey: queryKeys.Timeseries.QAWithTsId(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<QaAllData>(`/sensor_admin/qa_all/${ts_id}`);
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return query;
};
