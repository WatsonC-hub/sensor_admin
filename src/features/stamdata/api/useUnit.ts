import {useQuery, useMutation} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

export interface Unit {
  terminal_type: string;
  terminal_id: string;
  sensor_id: string;
  sensorinfo: string;
  calypso_id: number;
  batteriskift: string;
  startdato: string;
  slutdato: string;
  unit_uuid: string;
  gid: number;
  channel: string;
  sensortypeid: number;
  sensortypename: string;
  signal_id: number;
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

const editUnitMutation = (ts_id: number) =>
  useMutation({
    mutationKey: ['edit_unit'],
    mutationFn: async (data: any) => {
      const {data: out} = await apiClient.put(`/sensor_field/stamdata/update_unit/${ts_id}`, data);
      return out;
    },
    onSuccess: () => {
      toast.success('Udstyr er opdateret');
    },
    meta: {
      invalidates: [queryKeys.Timeseries.unitHistory(ts_id), queryKeys.AvailableUnits.all()],
    },
  });

const deleteUnitMutation = (ts_id: number) =>
  useMutation({
    mutationKey: ['delete_unit'],
    mutationFn: async (path: string) => {
      const {data: out} = await apiClient.delete(
        `/sensor_field/stamdata/delete_unit_history/${path}`
      );
      return out;
    },
    onSuccess: () => {
      toast.success('Udstyr er slettet');
    },
    meta: {
      invalidates: [queryKeys.Timeseries.unitHistory(ts_id), queryKeys.AvailableUnits.all()],
    },
  });

export const useUnitMutations = (ts_id: number) => {
  const editUnit = editUnitMutation(ts_id);
  const deleteUnit = deleteUnitMutation(ts_id);
  return {editUnit, deleteUnit};
};

export const useUnit = () => {
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
    onSuccess: () => {},
    meta: {
      invalidates: [queryKeys.AvailableUnits.all(), ['udstyr']],
    },
  });
  return {get, post};
};
