import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {AdjustmentTypes} from '~/helpers/EnumHelper';
import {APIError} from '~/queryClient';

export const getQAHistoryOptions = (ts_id: number | undefined) =>
  queryOptions<any, APIError>({
    queryKey: ['qa_all', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/qa_all/${ts_id}`);
      return data;
    },
    select: (data) => {
      const out = [];

      data.levelcorrection.forEach((item: any) => {
        out.push({
          data: item,
          type: AdjustmentTypes.LEVELCORRECTION,
        });
      });

      data.dataexclude.forEach((item: any) => {
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
    },
    enabled: typeof ts_id == 'number',
    refetchOnWindowFocus: false,
  });

const useQAHistory = (ts_id: number) => {
  return useQuery(getQAHistoryOptions(ts_id));
};

export default useQAHistory;
