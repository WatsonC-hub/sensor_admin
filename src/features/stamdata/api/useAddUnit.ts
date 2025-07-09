import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useAppContext} from '~/state/contexts';

export interface Unit {
  terminal_type: string;
  terminal_id: string;
  sensor_id: string;
  sensorinfo: string;
  calypso_id: number;
  batteriskift: string;
  startdato: string;
  slutdato: string;
  // uuid: string;
  unit_uuid: string;
  gid: number;
  channel: string;
  sensortypeid: number;
  sensortypename: string;
}

interface TypeUnitPost {
  unit_uuid: string;
  startdate: string;
  enddate: string;
  inherit_invoice?: boolean;
}

interface UnitBase {
  path: string;
  data?: any;
}
export interface UnitPost extends UnitBase {
  data: TypeUnitPost;
}
// interface UnitPut extends UnitBase {
//   data: TypeUnitPost;
// }
const unitPostOptions = {
  mutationKey: ['unit_post'],
  mutationFn: async (mutation_data: UnitPost) => {
    const {path, data} = mutation_data;
    const {data: result} = await apiClient.post(
      `/sensor_field/stamdata/unit_history/${path}`,
      data
    );
    return result;
  },
};
// const unitPutOptions = {
//   mutationKey: ['unit_put'],
//   mutationFn: async (mutation_data: UnitPut) => {
//     const {path, data} = mutation_data;
//     const {data: result} = await apiClient.put(
//       `//${path}`,
//       data
//     ); /* Write the url for the endpoint  */
//     return result;
//   },
// };
// const unitDelOptions = {
//   mutationKey: ['unit_del'],
//   mutationFn: async (mutation_data: UnitBase) => {
//     const {path} = mutation_data;
//     const {data: result} = await apiClient.delete(
//       `//${path}`
//     ); /* Write the url for the endpoint  */
//     return result;
//   },
// };

const onAddUnitMutation = (loc_id: number | undefined, ts_id: number | undefined) => {
  return {
    meta: {
      invalidates: [
        queryKeys.AvailableUnits.all(),
        queryKeys.Location.timeseries(loc_id),
        queryKeys.Location.metadata(loc_id),
        queryKeys.Timeseries.metadata(ts_id),
        queryKeys.Tasks.all(),
        queryKeys.Map.all(),
      ],
    },
  };
};

export const useUnit = () => {
  const {loc_id, ts_id} = useAppContext([], ['loc_id', 'ts_id']);
  const queryClient = useQueryClient();
  const get = useQuery({
    queryKey: queryKeys.AvailableUnits.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Unit>>(`/sensor_field/stamdata/available_units`);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  const post = useMutation({
    ...unitPostOptions,
    onMutate: () => onAddUnitMutation(loc_id, ts_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.AvailableUnits.all(),
      });
      toast.success('Enhed gemt');
    },
  });
  // const put = useMutation({
  //   ...unitPutOptions,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: queryKeys.AvailableUnits.all(),
  //     });
  //     toast.success('Enhed ændret');
  //   },
  // });
  // const del = useMutation({
  //   ...unitDelOptions,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: queryKeys.AvailableUnits.all(),
  //     });
  //     toast.success('Enhed slettet');
  //   },
  // });
  // return {get, post, put, del};
  return {get, post};
};
