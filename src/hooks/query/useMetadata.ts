import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {APIError} from '~/queryClient';
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
  groups: string[];
  unit: string;
  prefix: string | null;
  unit_uuid: string | null;
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
  groups: string[];
  projectno: string | undefined;
  timeseries: Array<{
    ts_id: number;
    tstype_id: number;
    ts_name: string;
    calculated: boolean;
    prefix: string | null;
    tstype_name: string;
  }>;
};

export const metadataQueryOptions = (ts_id?: number) => {
  return queryOptions<Metadata, APIError>({
    queryKey: ['metadata', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined,
    refetchOnWindowFocus: false,
  });
};

export const locationMetadataQueryOptions = (loc_id: number | undefined) => {
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
        groups: data[0].groups,
        description: data[0].description,
        mainloc: data[0].mainloc,
        projectno: data.find((location) => location.projectno !== null)?.projectno ?? undefined,
        subloc: data[0].subloc,
        terrainlevel: data[0].terrainlevel,
        terrainqual: data[0].terrainqual,
        x: data[0].x,
        y: data[0].y,
        timeseries: data
          .filter((item) => item.ts_id)
          .map((data) => {
            return {
              ts_id: data.ts_id!,
              tstype_id: data.tstype_id,
              ts_name: data.ts_name,
              calculated: data.calculated,
              prefix: data.prefix,
              tstype_name: data.tstype_name,
            };
          }),
      };
      return location_data;
    },
    enabled: loc_id !== undefined,
    refetchOnWindowFocus: false,
  });
};

export const useTimeseriesData = (ts_id?: number) => {
  const {ts_id: app_ts_id} = useAppContext([], ['ts_id']);

  const inner_ts_id = ts_id ?? app_ts_id;

  const query = useQuery(metadataQueryOptions(inner_ts_id));

  return query;
};

export const useLocationData = (loc_id?: number) => {
  const {loc_id: app_loc_id} = useAppContext([], ['loc_id']);

  const inner_loc_id = loc_id ?? app_loc_id;

  const query = useQuery(locationMetadataQueryOptions(inner_loc_id));

  return query;
};
