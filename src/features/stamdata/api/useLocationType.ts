import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type locationType = {
  loctype_id: number;
  loctypename: string;
};

export const getLocationTypeOptions = () => {
  return queryOptions({
    queryKey: ['location_types'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<locationType>>(
        `/sensor_field/stamdata/location_types`
      );
      return data;
    },
    refetchOnWindowFocus: false,
  });
};

export const getLocationTypeInfoOptions = (loctype_id: number | undefined) => {
  return queryOptions({
    queryKey: ['location_types', loctype_id],
    queryFn: async () => {
      const {data} = await apiClient.get<locationType>(
        `/sensor_field/stamdata/location_types/${loctype_id}`
      );
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: loctype_id !== undefined,
  });
};

const useLocationType = () => {
  const get = useQuery(getLocationTypeOptions());

  return {get};
};

export default useLocationType;
