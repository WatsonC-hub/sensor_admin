import {queryOptions, useQuery} from '@tanstack/react-query';
import {apiClient} from '~/apiClient';
// u.calypso_id,
// u.terminal_id,
// u.unit_uuid,
// s.channel,
// s.sensor_id,
// s.sensortype_id,
// s2."type",
// all_t.parameter,
// tt.tstype_name,
// l.loc_name,
// uth.enddate,
// ld.timeofmeas,
// case
//     when uth.enddate is not null
//     and ld.timeofmeas is not null
//     and uth.enddate > now()
//     and ld.timeofmeas > (now() - (1 || 'days'::text)::interval) then 0
//     when (uth.enddate is null
//         or uth.enddate < now())
//     and (ld.timeofmeas is null
//         or ld.timeofmeas < (now() - (1 || 'days'::text)::interval)) then 1
//     when (uth.enddate is null
//         or uth.enddate < now())
//     and ld.timeofmeas > (now() - (1 || 'days'::text)::interval) then 2
//     when uth.enddate is not null
//     and uth.enddate > now()
//     and (ld.timeofmeas is null
//         or ld.timeofmeas < (now() - (1 || 'days'::text)::interval)) then 3
// end as flag
export type Details = {
  calypso_id: string;
  terminal_id: string;
  unit_uuid: string;
  channel: string;
  sensor_id: string;
  sensortype_id: string;
  type: string;
  ts_id: number;
  parameter: string;
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
