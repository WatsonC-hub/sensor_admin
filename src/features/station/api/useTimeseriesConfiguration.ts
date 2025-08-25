import {queryOptions, useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';

export type Config = {
  sampleInterval: number;
  sendInterval: number;
};

export type Configuration = {
  currentConfig: Config | null;
  savedConfig: Config | null;
  configPossible: boolean;
  configState: 'inSync' | 'pending' | 'failed' | null;
};

export const timeseriesConfigurationOptions = (ts_id: number) =>
  queryOptions<Configuration, APIError>({
    queryKey: queryKeys.Timeseries.configuration(ts_id!),
    queryFn: async () => {
      const {data} = await apiClient.get<Configuration>(
        `/sensor_field/station/configuration/${ts_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useTimeseriesConfiguration = (ts_id: number) => {
  const user = useUser();
  return useQuery({
    ...timeseriesConfigurationOptions(ts_id),
    enabled: user?.features?.iotAccess && ts_id !== undefined,
  });
};

export const useTimeseriesConfigurationMutation = (ts_id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Config) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/station/configuration/${ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      // Invalidate query to refetch updated configuration
      toast.success('Konfiguration gemt');
      queryClient.invalidateQueries({
        queryKey: queryKeys.Timeseries.configuration(ts_id),
      });
    },
  });
};
