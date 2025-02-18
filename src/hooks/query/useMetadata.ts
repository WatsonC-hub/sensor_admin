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
  group: string[];
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
  group: string[];
  projectno: string | undefined;
  timeseries: Array<{
    ts_id: number | undefined;
    tstype_id: number;
    ts_name: string;
    calculated: boolean;
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

export const locationMetadtaQueryOptions = (loc_id: number | undefined) => {
  return queryOptions({
    queryKey: ['location_data', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Metadata>>(
        `/sensor_field/station/metadata_location/${loc_id}`
      );
      return data;
    },
    select: (data) => {
      const location_data: LocationMetadata = {
        loc_id: data[0].loc_id,
        loc_name: data[0].loc_name,
        loctype_id: data[0].loctype_id,
        group: data[0].group,
        description: data[0].description,
        mainloc: data[0].mainloc,
        projectno: data[0].projectno,
        subloc: data[0].subloc,
        terrainlevel: data[0].terrainlevel,
        terrainqual: data[0].terrainqual,
        x: data[0].x,
        y: data[0].y,
        timeseries: data.map((data) => {
          return {
            ts_id: data.ts_id,
            tstype_id: data.tstype_id,
            ts_name: data.ts_name,
            calculated: data.calculated,
          };
        }),
      };
      console.log(location_data);
      return location_data;
    },
    enabled: loc_id !== undefined,
    refetchOnWindowFocus: false,
  });
};

export const useTimeseriesData = (ts_id?: number) => {
  const {ts_id: app_ts_id} = useAppContext([], ['ts_id']);

  const inner_ts_id = ts_id ?? app_ts_id;

  if (inner_ts_id === undefined) {
    throw new Error('ts_id is undefined');
  }

  const query = useQuery(metadataQueryOptions(inner_ts_id));

  return query;
};

export const useLocationData = (loc_id?: number) => {
  const {loc_id: app_loc_id} = useAppContext([], ['loc_id']);

  const inner_loc_id = loc_id ?? app_loc_id;

  if (inner_loc_id === undefined) {
    throw new Error('loc_id is undefined');
  }

  const query = useQuery(locationMetadtaQueryOptions(inner_loc_id));

  return query;
};
