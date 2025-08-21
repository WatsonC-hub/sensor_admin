import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

type Config = {
  sampleInterval: number;
  sendInterval: number;
};

type Configuration = {
  currentConfig: Config | null;
  savedConfig: Config | null;
  configPossible: boolean;
};

export const timeseriesConfigurationOptions = (ts_id: number) =>
  queryOptions({
    queryKey: queryKeys.Timeseries.configuration(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get<Configuration>(
        `/sensor_field/station/configuration/${ts_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: ts_id !== undefined,
  });

export const useTimeseriesConfiguration = (ts_id: number) => {
  const user = useUser();
  return useQuery({
    ...timeseriesConfigurationOptions(ts_id),
    enabled: user?.features?.iotAccess && ts_id !== undefined,
  });
};
