import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type Details = {
  calypso_id: string | null;
  projectno: string | null;
  loc_id: number | null;
  ts_id: number | null;
  prefix: string | null;
  enddate: string | null;
  project_title: string | null;
  startdate: string;
  sensorinfo: string | null;
  terminal_id: string | null;
  ts_data: string | null;
  ts_logtype: string | null;
  loc_name: string | null;
  mainloc: string | null;
  description: string | null;
  groups: Array<string | null>;
  has_alarm: number | null;
  annual_price: number | null;
  subRows?: Details[];
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
