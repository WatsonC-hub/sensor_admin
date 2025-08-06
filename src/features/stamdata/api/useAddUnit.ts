import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
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
  startdate: Dayjs | undefined;
  enddate: Dayjs;
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

export const useUnit = () => {
  const {ts_id} = useAppContext([], ['ts_id']);
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.AvailableUnits.all(),
      });
      queryClient.invalidateQueries({
        queryKey: ['register', ts_id],
      });
      toast.success('Enhed gemt');
    },
    meta: {
      invalidates: [['metadata']],
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
