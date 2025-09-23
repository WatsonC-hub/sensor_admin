import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';

export type RequiredServiceConfiguration = {
  required_service: boolean | undefined;
};

export type RequiredServiceConfigurationUpdate = {
  required_service?: boolean | null;
};

export type RequiredServiceConfigurationInsert = {
  ts_id: number;
  required_service?: boolean | null;
};

export const requiredServiceOptions = (ts_id: number) =>
  queryOptions<RequiredServiceConfiguration, APIError>({
    queryKey: queryKeys.Timeseries.RequiredService(ts_id!),
    queryFn: async () => {
      const {data} = await apiClient.get<RequiredServiceConfiguration>(
        `/sensor_field/configuration/required_service/${ts_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useRequiredService = (ts_id: number) => {
  return useQuery({
    ...requiredServiceOptions(ts_id),
  });
};

export const useRequiredServiceMutation = (ts_id: number) => {
  return useMutation({
    mutationFn: async (data: RequiredServiceConfigurationUpdate) => {
      const {data: response} = await apiClient.post(
        `/sensor_field/configuration/required_service/${ts_id}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Konfiguration gemt');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });
};

export const useRequiredServiceInsertMutation = () => {
  return useMutation({
    mutationFn: async (data: RequiredServiceConfigurationInsert) => {
      const {data: response} = await apiClient.post(
        `/sensor_field/configuration/required_service/${data.ts_id}`,
        {required_service: data.required_service}
      );
      return response;
    },
    onSuccess: () => {
      toast.success('Konfiguration gemt');
    },
    meta: {
      invalidates: [['metadata']],
    },
  });
};

export default useRequiredService;
