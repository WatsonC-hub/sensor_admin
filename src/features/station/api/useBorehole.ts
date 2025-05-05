import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {BoreholeData} from '~/types';

export type Borehole = {
  boreholeno: string;
  latitude: number;
  longitude: number;
};

const boreholeListOptions = () => {
  const user = useUser();
  return queryOptions({
    queryKey: ['borehole_list'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<BoreholeData>>(`/sensor_field/borehole_list`);
      return data;
    },
    enabled: user?.boreholeAccess,
  });
};

export const boreholesOptions = () => {
  const user = useUser();
  return queryOptions({
    queryKey: ['boreholes'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Borehole>>(`/sensor_field/boreholes`);
      return data;
    },
    staleTime: 10 * 1000,
    enabled: user?.boreholeAccess,
  });
};

export const useSearchBorehole = (boreholeno: string | undefined) => {
  const user = useUser();
  const searched_boreholes = useQuery({
    queryKey: ['search_borehole', boreholeno],
    queryFn: async () => {
      const response = await apiClient.get<Array<Borehole>>(
        `/sensor_field/boreholes/${boreholeno}`
      );
      const data = response.data;
      return data;
    },
    staleTime: 10 * 1000,
    enabled: boreholeno !== undefined && boreholeno !== '' && user?.boreholeAccess,
  });
  return searched_boreholes;
};

const useBorehole = () => {
  const get = useQuery(boreholeListOptions());

  return {get};
};

export default useBorehole;
