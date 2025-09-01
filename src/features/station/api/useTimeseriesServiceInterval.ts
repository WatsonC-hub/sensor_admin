import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';

export type ServiceConfiguration = {
  controlsPerYear: number | undefined;
  isCustomerService: boolean | undefined;
  leadTime: number | undefined;
  // forvarselstid
};

export type ServiceConfigurationUpdate = {
  controls_per_year?: number | undefined;
  lead_time?: number | undefined;
};

export const timeseriesServiceIntervalOptions = (ts_id: number) =>
  queryOptions<ServiceConfiguration, APIError>({
    queryKey: queryKeys.Timeseries.ServiceInterval(ts_id!),
    queryFn: async () => {
      const {data} = await apiClient.get<ServiceConfiguration>(
        `/sensor_field/configuration/service_interval/${ts_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useTimeseriesServiceInterval = (ts_id: number) => {
  const user = useUser();
  return useQuery({
    ...timeseriesServiceIntervalOptions(ts_id),
    enabled: user?.features?.iotAccess && ts_id !== undefined,
  });
};

export const useTimeseriesServiceIntervalMutation = (ts_id: number) => {
  return useMutation({
    mutationFn: async (data: ServiceConfigurationUpdate) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/configuration/service_interval/${ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      toast.success('Konfiguration gemt');
    },
    meta: {
      invalidates: [['register']],
    },
  });
};
