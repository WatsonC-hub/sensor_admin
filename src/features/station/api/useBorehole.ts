import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {BoreholeData, BoreholeMapData} from '~/types';

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
    enabled: user?.features?.boreholeAccess,
  });
};

export const searchBorehole = (boreholeno: string | undefined | null) => {
  const innerFn = async () => {
    if (!boreholeno) {
      return [];
    }
    const {data} = await apiClient.get<Array<BoreholeMapData>>(
      `/sensor_field/boreholes/${boreholeno}`
    );

    return data;
  };
  return innerFn;
};

const boreholeSearchOptions = (boreholeno: string | undefined | null) => {
  const user = useUser();
  return queryOptions({
    queryKey: ['search_borehole', boreholeno],
    queryFn: searchBorehole(boreholeno),
    staleTime: 10 * 1000,
    enabled:
      boreholeno !== undefined &&
      boreholeno !== null &&
      boreholeno !== '' &&
      user?.features?.boreholeAccess,
  });
};

export const useSearchBorehole = (boreholeno: string | undefined | null) => {
  const searched_boreholes = useQuery(boreholeSearchOptions(boreholeno));
  return searched_boreholes;
};

const useBorehole = () => {
  const get = useQuery(boreholeListOptions());

  return {get};
};

export default useBorehole;
