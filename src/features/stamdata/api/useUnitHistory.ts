import {useQuery} from '@tanstack/react-query';
import {} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
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
  signal_id: number;
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

export type LocationActiveUnits = {
  calypso_id: number;
  gid: number;
  enddate: string;
  sensor_id: string;
  ts_id: number;
  unit_uuid: string;
  startdate: string;
  terminal_id: string;
  signal_id: number;
};

export const useLocationActiveUnits = (ts_id: number | undefined) => {
  const query = useQuery<LocationActiveUnits[]>({
    queryKey: queryKeys.Timeseries.unitHistory2(),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/unit_history_batch/${ts_id}`);
      return data;
    },
    refetchOnWindowFocus: false,
    enabled: ts_id !== undefined,
  });

  return query;
};
