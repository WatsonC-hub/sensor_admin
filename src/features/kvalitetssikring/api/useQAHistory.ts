import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {AdjustmentTypes} from '~/helpers/EnumHelper';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {AdjustmentData, QaAllData} from '~/types';

const transformQAHistory = (data: QaAllData) => {
  const out: AdjustmentData[] = [];

  data.levelcorrection.forEach((item) => {
    out.push({
      data: item,
      type: AdjustmentTypes.LEVELCORRECTION,
    });
  });

  data.dataexclude.forEach((item) => {
    if (item.max_value == null) {
      out.push({
        data: item,
        type: AdjustmentTypes.EXLUDETIME,
      });
    } else {
      out.push({
        data: item,
        type: AdjustmentTypes.EXLUDEPOINTS,
      });
    }
  });
  if (data.min_max_cutoff) {
    out.push({
      data: data.min_max_cutoff,
      type: AdjustmentTypes.MINMAX,
    });
  }

  return out;
};

export const getQAHistoryOptions = (ts_id: number) =>
  queryOptions({
    queryKey: queryKeys.Timeseries.QAWithTsId(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<QaAllData>(`/sensor_admin/qa_all/${ts_id}`);
      return data;
    },
    select: transformQAHistory,
    enabled: typeof ts_id == 'number',
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

const useQAHistory = (ts_id: number) => {
  return useQuery(getQAHistoryOptions(ts_id));
};

export default useQAHistory;
