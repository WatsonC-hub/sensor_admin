import {useQuery} from '@tanstack/react-query';
import {} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useAppContext} from '~/state/contexts';

export type UnitHistory = {
  calypso_id: number;
  gid: number;
  slutdato: string;
  sensor_id: string;
  sensorinfo: string;
  ts_id: number;
  uuid: string;
  startdato: string;
  terminal_id: string;
  terminal_type: string;
};

export const useUnitHistory = () => {
  const {ts_id} = useAppContext([], ['ts_id']);

  const query = useQuery<UnitHistory[]>({
    queryKey: queryKeys.Timeseries.unitHistory(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/unit_history/${ts_id}`);
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: ts_id !== undefined,
  });
  return query;
};
