import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';

export type Unit = {
  calypso_id: string | null;
  enddate: string | null;
  projectno: string | null;
  project_title: string | null;
  startdate: string;
  terminal_id: string | null;
  ts_data: string[] | null;
  ts_logtype: string[] | null;
  loc_name: string | null;
  mainloc: string | null;
  description: string | null;
  subRows?: Unit[];
};

const unitGetOptions = queryOptions({
  queryKey: ['lookup_units'],
  queryFn: async () => {
    // Fetch units from API
    const {data} = await apiClient.get<Array<Unit>>('/overview/units');

    return data;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
});

const useUnits = () => {
  const get = useQuery(unitGetOptions);

  return {
    get,
  };
};

export default useUnits;
