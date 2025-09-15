import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type Details = {
  calypso_id: string;
  terminal_id: string;
  unit_uuid: string;
  channel: string;
  sensor_id: string;
  sensortype_id: string;
  type: string;
  ts_id: number;
  sendintervalminutes: number | null;
  sampleintervalminutes: number | null;
  tstype_name: string;
  loc_id: number;
  loc_name: string;
  enddate: string | null;
  timeofmeas: string | null;
  flag: number | null;
};

const detailGetOptions = queryOptions({
  queryKey: ['lookup_detail'],
  queryFn: async () => {
    // Fetch units from API
    const {data} = await apiClient.get<Array<Details>>('/overview/detail');

    return data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

const useDetails = () => {
  const get = useQuery(detailGetOptions);

  return {
    get,
  };
};

export default useDetails;
