import {queryOptions, useQuery} from '@tanstack/react-query';
import axios from 'axios';

import {EXPLORER_BASE} from '~/features/fieldObservation/api/useGisLayers';
import {toVectorLayerStyle} from '~/features/fieldObservation/vectorStyle';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

import type {Gc2Class, VectorLayerStyle} from '~/features/fieldObservation/vectorStyle';

/**
 * A GIS layer tagged with this in GC2 is not fetched as vector data (WFS-style) and is only shown
 * as WMS, online: for layers that are too large, too slow or not public.
 */
export const NO_WFS_TAG = 'no-wfs';

/** What Field needs from GC2's own metadata about a layer to fetch and draw it as vector data. */
export type Gc2LayerMeta = {
  id: string;
  /** GC2 geometry type, e.g. MULTIPOLYGON or RASTER. */
  type: string;
  srid: number;
  geometryColumn: string;
  /** The non-geometry columns. */
  columns: string[];
  tags: string[];
  /** Drawn by GC2 from another WMS (e.g. Dataforsyningen), so there are no features. */
  cascaded: boolean;
  style: VectorLayerStyle;
};

type RawMeta = {
  f_table_schema: string;
  f_table_name: string;
  f_geometry_column: string;
  srid: number;
  type: string | null;
  tags: string | string[] | null;
  class: string | Gc2Class[] | null;
  fields: Record<string, {typname?: string}> | null;
  wmssource: string | null;
  bitmapsource: string | null;
};

const GEOMETRY_TYPES = new Set(['geometry', 'geography', 'raster']);

/** GC2 returns some columns as JSON text. */
const parseJson = <T>(value: string | T | null, fallback: T): T => {
  if (value === null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return (JSON.parse(value) as T | null) ?? fallback;
  } catch {
    return fallback;
  }
};

const toLayerMeta = (row: RawMeta): Gc2LayerMeta => {
  const type = row.type ?? '';
  return {
    id: `${row.f_table_schema}.${row.f_table_name}`,
    type,
    srid: row.srid,
    geometryColumn: row.f_geometry_column,
    columns: Object.entries(row.fields ?? {})
      .filter(
        ([name, field]) =>
          name !== row.f_geometry_column && !GEOMETRY_TYPES.has(field.typname ?? '')
      )
      .map(([name]) => name),
    tags: parseJson<string[]>(row.tags, []),
    cascaded: Boolean(row.wmssource || row.bitmapsource),
    style: toVectorLayerStyle(type, parseJson<Gc2Class[]>(row.class, [])),
  };
};

/** True when the layer can be fetched as features for an area and kept on the device. */
export const isWfsSuitable = (meta: Gc2LayerMeta | undefined): meta is Gc2LayerMeta =>
  meta !== undefined &&
  meta.type !== '' &&
  meta.type !== 'RASTER' &&
  !meta.cascaded &&
  !meta.tags.includes(NO_WFS_TAG);

/**
 * GC2's metadata for every layer tagged `gis`, read anonymously through Explorer's GC2 proxy
 * (`/api/v1/meta`), keyed by "schema.table". Only the parsed fields are kept, so the cached copy
 * is small and holds nothing like the cascaded WMS URLs.
 */
export const gc2MetaQueryOptions = queryOptions({
  queryKey: queryKeys.explorerGc2Meta(),
  queryFn: async () => {
    const {data} = await axios.get<{success: boolean; data?: RawMeta[]}>(
      `${EXPLORER_BASE}/gc2/api/v1/meta/watsonc/tag:gis`,
      {timeout: 30_000}
    );
    return Object.fromEntries(
      (data.data ?? []).map((row) => {
        const meta = toLayerMeta(row);
        return [meta.id, meta];
      })
    ) as Record<string, Gc2LayerMeta>;
  },
  staleTime: 1000 * 60 * 60,
  gcTime: 1000 * 60 * 60 * 24 * 7,
});

export const useGc2Meta = () => useQuery(gc2MetaQueryOptions);
