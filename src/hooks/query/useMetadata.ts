import {useQuery, queryOptions} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {Group} from '~/types';

type Metadata = {
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
  suffix: string | undefined;
  intakeno: number;
  groups: Group[];
  unit: string;
  prefix: string | null;
  unit_uuid: string | null;
  startdato: string | null;
  slutdato: string | null;
  timeseries_calypso_id: number | null;
};

type LocationMetadata = {
  loc_id: number;
  boreholeno: string | undefined;
  loc_name: string;
  suffix: string | undefined;
  mainloc: string;
  subloc: string;
  description: string | undefined;
  loctype_id: number;
  x: number;
  y: number;
  terrainlevel: number;
  terrainqual: string;
  groups: Group[];
  projectno: string | undefined;
  unit_uuid: string | undefined | null;
  timeseries: Array<{
    ts_id: number;
    tstype_id: number;
    ts_name: string;
    calculated: boolean;
    prefix: string | null;
    tstype_name: string;
    intakeno: number;
    timeseries_calypso_id?: number | null;
  }>;
};

export const metadataQueryOptions = (ts_id?: number) => {
  return queryOptions<Metadata, APIError>({
    queryKey: queryKeys.Timeseries.metadata(ts_id),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata/${ts_id}`);
      return data;
    },
    enabled: ts_id !== undefined,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};

const locationMetadataQueryOptions = (loc_id: number | undefined) => {
  const {ts_id} = useAppContext([], ['ts_id']);
  return queryOptions({
    queryKey: queryKeys.Location.metadata(loc_id),
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
        boreholeno: data[0].boreholeno ?? undefined,
        suffix: data[0].suffix ?? undefined,
        loctype_id: data[0].loctype_id,
        groups: data[0].groups,
        description: data[0].description,
        mainloc: data[0].mainloc,
        projectno:
          data.find((location) => location.ts_id === ts_id)?.projectno ?? data[0].projectno,
        subloc: data[0].subloc,
        terrainlevel: data[0].terrainlevel,
        terrainqual: data[0].terrainqual ?? 'DTM',
        x: data[0].x,
        y: data[0].y,
        unit_uuid: data.find((location) => location.unit_uuid !== undefined)?.unit_uuid,
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
              intakeno: data.intakeno,
              timeseries_calypso_id: data.timeseries_calypso_id,
            };
          }),
      };
      return location_data;
    },
    enabled: loc_id !== undefined,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1,
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
