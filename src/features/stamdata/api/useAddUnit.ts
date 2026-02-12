import {useQuery, useMutation} from '@tanstack/react-query';
import {Dayjs} from 'dayjs';

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
