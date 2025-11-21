import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {BoreholeMapData} from '~/types';

export type Borehole = {
  boreholeno: string;
  latitude: number;
  longitude: number;
};

export const findBorehole = async (boreholeno: string | undefined | null) => {
  const {data} = await apiClient.get<BoreholeMapData>(`/sensor_field/jupiter/search/${boreholeno}`);

  return data;
};

const boreholeSearchOptions = (boreholeno: string | undefined | null) => {
  const {
    features: {boreholeAccess},
  } = useUser();
  return queryOptions({
    queryKey: queryKeys.Borehole.findBorehole(boreholeno),
    queryFn: () => findBorehole(boreholeno),
    staleTime: 10 * 1000,
    enabled: boreholeno !== undefined && boreholeno !== null && boreholeno !== '' && boreholeAccess,
  });
};

export const useFindBorehole = (boreholeno: string | undefined | null) => {
  const searched_boreholes = useQuery(boreholeSearchOptions(boreholeno));
  return searched_boreholes;
};
