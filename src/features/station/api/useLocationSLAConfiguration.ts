import {queryOptions, useMutation, useQuery} from '@tanstack/react-query';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';

type SLAConfiguration = {
  daysToVisitation?: number | undefined;
  isCustomerService?: boolean | undefined;
};

type SLAConfigurationUpdate = {
  days_to_visitation?: number | undefined;
};

const locationSLAConfigurationOptions = (loc_id: number) =>
  queryOptions<SLAConfiguration, APIError>({
    queryKey: queryKeys.Location.SLAConfiguration(loc_id!),
    queryFn: async () => {
      const {data} = await apiClient.get<SLAConfiguration>(
        `/sensor_field/configuration/sla_configuration/${loc_id}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useLocationSLAConfiguration = (loc_id: number) => {
  const {
    features: {iotAccess},
  } = useUser();
  return useQuery({
    ...locationSLAConfigurationOptions(loc_id),
    enabled: iotAccess && loc_id !== undefined,
  });
};

export const useLocationSLAConfigurationMutation = (loc_id: number) => {
  return useMutation({
    mutationFn: async (data: SLAConfigurationUpdate) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/configuration/sla_configuration/${loc_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      toast.success('Konfiguration gemt');
    },
    meta: {
      invalidates: [['register'], ['metadata']],
    },
  });
};
