import {queryOptions, useMutation, useSuspenseQuery} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

import type {APIError} from '~/queryClient';

type ServiceConfiguration = {
  controlsPerYear: number | null;
  isCustomerService: boolean | null;
  leadTime: number | null;
  from_unit: boolean;
  // forvarselstid
};

type ServiceConfigurationUpdate = {
  controls_per_year?: number | null;
  lead_time?: number | null;
};

const timeseriesServiceIntervalOptions = (ts_id: number) =>
  queryOptions<ServiceConfiguration, APIError>({
    queryKey: queryKeys.Timeseries.ServiceInterval(ts_id!),
    queryFn: async () => {
      const {data} = await apiClient.get<ServiceConfiguration>(
        `/sensor_field/configuration/yearly_controls/${ts_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useTimeseriesServiceInterval = (ts_id: number) => {
  return useSuspenseQuery({
    ...timeseriesServiceIntervalOptions(ts_id),
    // enabled: iotAccess && ts_id !== undefined,
  });
};

export const useTimeseriesServiceIntervalMutation = (ts_id: number) => {
  return useMutation({
    mutationFn: async (data: ServiceConfigurationUpdate) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/configuration/yearly_controls/${ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      toast.success('Konfiguration gemt');
    },
    meta: {
      invalidates: [queryKeys.Timeseries.ServiceInterval(ts_id), queryKeys.StationProgress(ts_id)],
    },
  });
};
