import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

export const useBoreholeData = (boreholeno) => {
  const query = useQuery(
    ['jupiter_boreholedata', boreholeno],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/dgu/${boreholeno}`);
      return data;
    },
    {
      enabled: boreholeno != '',
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  return query;
};
