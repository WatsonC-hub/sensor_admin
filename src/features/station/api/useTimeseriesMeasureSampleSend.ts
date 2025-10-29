import {queryOptions, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {APIError} from '~/queryClient';

export type MeasureSampleSend = {
  sampleInterval: number;
  sendInterval: number;
};

export type Configuration = {
  currentConfig: MeasureSampleSend | null;
  savedConfig: MeasureSampleSend | null;
  configPossible: boolean;
  configState: 'inSync' | 'pending' | 'failed' | 'outOfSync' | null;
  estimatedConfigChange: string | null;
};

export const timeseriesMeasureSampleSendOptions = (ts_id: number) =>
  queryOptions<Configuration, APIError>({
    queryKey: queryKeys.Timeseries.MeasureSampleSend(ts_id!),
    queryFn: async () => {
      const {data} = await apiClient.get<Configuration>(
        `/sensor_field/configuration/sample_send/${ts_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useTimeseriesMeasureSampleSend = (ts_id: number) => {
  const {data: timeseriesData} = useTimeseriesData(ts_id);
  const user = useUser();
  return useQuery({
    ...timeseriesMeasureSampleSendOptions(ts_id),
    enabled:
      user?.features?.iotAccess && ts_id !== undefined && timeseriesData?.calculated === false,
  });
};

export const useTimeseriesMeasureSampleSendMutation = (ts_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: MeasureSampleSend) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/configuration/sample_send/${ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      // Invalidate query to refetch updated configuration
      toast.success('Konfiguration gemt');
      queryClient.invalidateQueries({
        queryKey: queryKeys.Timeseries.MeasureSampleSend(ts_id),
      });
    },
    meta: {
      invalidates: [['register']],
    },
  });
};
