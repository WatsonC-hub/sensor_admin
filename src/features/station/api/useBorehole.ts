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

export const useSearchBorehole = (searchString: string) => {
  const user = useUser();
  const searched_boreholes = useQuery({
    queryKey: ['search_borehole', searchString],
    queryFn: async () => {
      const response = await apiClient.get<Array<Borehole>>(
        `/sensor_field/borehole_list/${searchString}`
      );
      const data = response.data;
      return data;
      //   const response = await postElasticSearch({
      //     query: {bool: {must: {query_string: {query: searchString}}}},
      //   });
      //   const data = response.data.hits.hits.map((item: any) => {
      //     return {
      //       boreholeno: item._source.properties.boreholeno,
      //       latitude: item._source.properties.latitude,
      //       longitude: item._source.properties.longitude,
      //     };
      //   });
      //   console.log(response.data.hits.hits);
      //   return data as Array<Borehole>;
    },
    staleTime: 10 * 1000,
    enabled: searchString !== '' && user?.boreholeAccess,
  });
  return searched_boreholes;
};

const useBorehole = () => {
  const get = useQuery(boreholeListOptions());

  return {get};
};

export default useBorehole;
