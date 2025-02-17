import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {useAppContext} from '~/state/contexts';

export type Metadata = {
  loc_id: number;
  loc_name: string;
  mainloc: string;
  subloc: string;
  description: string | undefined;
  loctype_id: number;
  ts_id: number | undefined;
  tstype_id: number;
  tstype_name: string;
  sensor_depth_m: number;
  x: number;
  y: number;
  terrainlevel: number;
  terrainqual: string;
  ts_name: string;
  maalepunktskote: number;
  projectno: string | undefined;
  batteriskift: string;
  calculated: boolean;
  boreholeno: string;
  intakeno: number;
  group: JSON;
  unit: string;
};

export type TimeseriesMetadata = {
  loc_id: number;
  loc_name: string;
  ts_id: number | undefined;
  tstype_id: number;
  tstype_name: string;
  sensor_depth_m: number;
  maalepunktskote: number;
  ts_name: string;
  calculated: boolean;
  batteriskift: string;
  unit: string;
};

export type LocationMetadata = {
  loc_id: number;
  loc_name: string;
  mainloc: string;
  subloc: string;
  description: string | undefined;
  loctype_id: number;
  x: number;
  y: number;
  terrainlevel: number;
  terrainqual: string;
  group: JSON;
  projectno: string | undefined;
  timeseries: Array<{
    ts_id: number | undefined;
    tstype_id: number;
    ts_name: string;
  }>;
};

export const metadataQueryOptions = (ts_id?: number) => {
  return queryOptions({
    queryKey: ['metadata', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Metadata>(`/sensor_field/station/metadata/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined,
    refetchOnWindowFocus: false,
  });
};

export const useTimeseriesData = () => {
  const {metadata, error, pending} = useMetadata();
  const timeseries_data = metadata as TimeseriesMetadata;
  return {timeseries_data, error, pending};
};

export const useLocationData = () => {
  const {metadata, error, pending} = useMetadata();
  const data = metadata as Metadata[];
  let location_data: LocationMetadata | undefined = undefined;

  if (!data) return {location_data, error, pending};

  location_data = {
    ...data[0],
    timeseries: data.map((data) => {
      return {
        ts_id: data.ts_id,
        tstype_id: data.tstype_id,
        ts_name: data.ts_name,
      };
    }),
  };

  return {location_data, error, pending};
};

export const useMetadata = (ts_id?: number) => {
  const {ts_id: app_ts_id, loc_id} = useAppContext([], ['ts_id', 'loc_id']);

  const inner_ts_id = ts_id ?? app_ts_id;

  let metadata = undefined;
  let error = undefined;
  let pending = undefined;

  const {data, error: error2, isPending: pending2} = useQuery(metadataQueryOptions(inner_ts_id));

  const {
    data: data2,
    error: error3,
    isPending: pending3,
  } = useQuery({
    queryKey: ['location_data', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Metadata>>(
        `/sensor_field/station/metadata_location/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined && inner_ts_id === undefined,
    refetchOnWindowFocus: false,
  });

  metadata = data ?? data2;
  error = error2 ?? error3;
  pending = data ? pending2 : pending3;

  return {metadata, error, pending};
};
