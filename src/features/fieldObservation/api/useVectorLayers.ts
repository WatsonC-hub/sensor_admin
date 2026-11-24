import {useQueries} from '@tanstack/react-query';
import axios from 'axios';
import {useLiveQuery} from 'dexie-react-hooks';
import {useMemo} from 'react';

import {isWfsSuitable, useGc2Meta} from '~/features/fieldObservation/api/useGc2Meta';
import {EXPLORER_BASE} from '~/features/fieldObservation/api/useGisLayers';
import {vertices} from '~/features/fieldObservation/geo';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import useOnlineStatus from '~/hooks/useOnlineStatus';

import type {Gc2LayerMeta} from '~/features/fieldObservation/api/useGc2Meta';
import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {Geometry, VectorLayerCache} from '~/features/fieldObservation/types';

/**
 * GIS layers fetched as vector data for the chosen projekt's area through GC2's SQL API, stored
 * on the device and drawn on canvas, so they also show offline. Every layer that isn't a raster,
 * a cascaded WMS or tagged `no-wfs` in GC2 (useGc2Meta); the rest stay WMS, online only.
 */

/** Around the projekt's feltobservationer and projektlag, so the edges are covered too. */
const BUFFER_M = 500;
/** More than this is cut off; a projekt that big needs another approach. */
const MAX_FEATURES = 20_000;

type Bbox = [number, number, number, number];

/** [minLon, minLat, maxLon, maxLat] around the geometries, grown by BUFFER_M; null for none. */
export const extentBbox = (geometries: Geometry[]): Bbox | null => {
  // A loop, not Math.min(...all), which overflows the stack on a large projektlag.
  let [minLon, minLat, maxLon, maxLat] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const geometry of geometries) {
    for (const [lon, lat] of vertices(geometry)) {
      minLon = Math.min(minLon, lon);
      minLat = Math.min(minLat, lat);
      maxLon = Math.max(maxLon, lon);
      maxLat = Math.max(maxLat, lat);
    }
  }
  if (minLon === Infinity) return null;
  const midLat = (minLat + maxLat) / 2;
  const dLat = BUFFER_M / 111_320;
  const dLon = BUFFER_M / (111_320 * Math.cos((midLat * Math.PI) / 180));
  // Rounded, so a small change to the projekt doesn't make a new request each time.
  const round = (value: number) => Math.round(value * 1000) / 1000;
  return [round(minLon - dLon), round(minLat - dLat), round(maxLon + dLon), round(maxLat + dLat)];
};

const cacheKey = (layerId: string, projectNo: string) => `${layerId}|${projectNo}`;

const quoteIdent = (name: string) => `"${name.replaceAll('"', '""')}"`;

/** ST_CollectionExtract's type for the layer, so a clipped polygon stays a polygon. */
const COLLECTION_TYPE = {POINT: 1, LINE: 2, POLYGON: 3} as const;

/**
 * SQL for the layer's features inside the bbox, cut to it: a kommune or an indvindingsopland is
 * far larger than a projekt. Names are quoted; only numbers from the bbox and GC2's srid go in
 * unquoted.
 */
const featuresSql = (meta: Gc2LayerMeta, bbox: Bbox) => {
  const [schema, table] = meta.id.split('.');
  const geom = quoteIdent(meta.geometryColumn);
  const srid = Math.trunc(Number(meta.srid));
  const envelope = `ST_Transform(ST_MakeEnvelope(${bbox.map((value) => value.toFixed(6)).join(', ')}, 4326), ${srid})`;
  const collectionType = Object.entries(COLLECTION_TYPE).find(([type]) =>
    meta.type.includes(type)
  )?.[1];
  const clipped =
    collectionType === 1
      ? geom
      : collectionType === undefined
        ? `ST_Intersection(${geom}, ${envelope})`
        : `ST_CollectionExtract(ST_Intersection(${geom}, ${envelope}), ${collectionType})`;
  const columns = [...meta.columns.map(quoteIdent), `${clipped} AS ${geom}`];
  return (
    `SELECT ${columns.join(', ')} FROM ${quoteIdent(schema)}.${quoteIdent(table)} ` +
    `WHERE ${geom} && ${envelope} AND ST_Intersects(${geom}, ${envelope}) ` +
    `LIMIT ${MAX_FEATURES + 1}`
  );
};

const fetchVectorLayer = async (
  db: FieldObservationDb,
  meta: Gc2LayerMeta,
  projectNo: string,
  bbox: Bbox
) => {
  const response = await axios.get<string>(`${EXPLORER_BASE}/gc2/api/v1/sql/watsonc`, {
    params: {q: featuresSql(meta, bbox), srs: 4326},
    responseType: 'text',
    timeout: 120_000,
  });
  const body = JSON.parse(response.data) as {
    success?: boolean;
    message?: string;
    features?: GeoJSON.Feature[];
  };
  if (!body.success || !body.features) {
    throw new Error(body.message ?? `${meta.id} kunne ikke hentes`);
  }
  const truncated = body.features.length > MAX_FEATURES;
  // A clipped geometry can come back empty (touching the edge only); there is nothing to draw.
  const features = (truncated ? body.features.slice(0, MAX_FEATURES) : body.features).filter(
    (feature) => feature.geometry !== null
  );

  const record: VectorLayerCache = {
    key: cacheKey(meta.id, projectNo),
    layer_id: meta.id,
    project_no: projectNo,
    bbox,
    fetched_at: new Date().toISOString(),
    feature_count: features.length,
    bytes: response.data.length,
    truncated,
    style: meta.style,
    features: {type: 'FeatureCollection', features},
  };
  await db.vectorLayers.put(record);
  return record.fetched_at;
};

/** Whether a GIS layer that is on is saved on the device for the projekt, and if not, why. */
export type VectorLayerStatus =
  /** A raster, a cascaded WMS or tagged no-wfs: WMS only, so not shown offline. */
  | {state: 'online-only'}
  /** GC2's metadata isn't loaded (yet), and nothing is saved. */
  | {state: 'unknown'}
  /** Can be saved, but no projekt is chosen. */
  | {state: 'no-project'}
  /** Can be saved, but the projekt has no feltobservationer or projektlag to give it an area. */
  | {state: 'no-area'}
  /** Can be saved, but hasn't been yet (offline since it was turned on). */
  | {state: 'not-saved'}
  | {state: 'saving'; record: VectorLayerCache | null}
  | {state: 'saved'; record: VectorLayerCache}
  | {state: 'error'; record: VectorLayerCache | null; message: string};

/** True when the layer is drawn from the device, so it also shows offline. */
export const isSavedOffline = (status: VectorLayerStatus | undefined) =>
  status !== undefined && 'record' in status && status.record !== null;

/**
 * The vector GIS layers for the chosen projekt, from the device, and each active layer's status.
 * While online, a layer that is on is fetched for the projekt's area once a day, when the area
 * grows past the stored one, on Hent igen, or on Overfør nu.
 */
export const useVectorLayers = (
  db: FieldObservationDb,
  projectNo: string | null,
  extent: Geometry[],
  activeLayerIds: string[]
) => {
  const online = useOnlineStatus();
  const bbox = useMemo(() => extentBbox(extent), [extent]);
  const {data: metaById} = useGc2Meta();
  const suitable = activeLayerIds.map((id) => metaById?.[id]).filter(isWfsSuitable);

  const results = useQueries({
    queries: suitable.map((meta) => ({
      queryKey: queryKeys.fieldObservationVectorLayer(
        meta.id,
        projectNo ?? '',
        bbox?.join(',') ?? ''
      ),
      queryFn: () => fetchVectorLayer(db, meta, projectNo!, bbox!),
      enabled: online && projectNo !== null && bbox !== null,
      staleTime: 24 * 60 * 60 * 1000,
      retry: 1,
    })),
  });

  const stored = useLiveQuery(
    async () => {
      if (!projectNo || activeLayerIds.length === 0) return [];
      const records = await db.vectorLayers.bulkGet(
        activeLayerIds.map((layerId) => cacheKey(layerId, projectNo))
      );
      return records.filter((record): record is VectorLayerCache => record !== undefined);
    },
    [db, projectNo, activeLayerIds.join(',')],
    []
  );

  // A layer later tagged no-wfs in GC2 is drawn as WMS again, not from its old copy.
  const records = useMemo(
    () => stored.filter((record) => !metaById || isWfsSuitable(metaById[record.layer_id])),
    [stored, metaById]
  );

  const statuses: Record<string, VectorLayerStatus> = {};
  for (const layerId of activeLayerIds) {
    const record = records.find((item) => item.layer_id === layerId) ?? null;
    const index = suitable.findIndex((meta) => meta.id === layerId);
    const query = index >= 0 ? results[index] : undefined;
    if (query?.isFetching) {
      statuses[layerId] = {state: 'saving', record};
    } else if (query?.isError) {
      statuses[layerId] = {state: 'error', record, message: query.error.message};
    } else if (record) {
      statuses[layerId] = {state: 'saved', record};
    } else if (metaById && index < 0) {
      statuses[layerId] = {state: 'online-only'};
    } else if (!metaById) {
      statuses[layerId] = {state: 'unknown'};
    } else if (projectNo === null) {
      statuses[layerId] = {state: 'no-project'};
    } else if (bbox === null) {
      statuses[layerId] = {state: 'no-area'};
    } else {
      statuses[layerId] = {state: 'not-saved'};
    }
  }

  return {records, statuses};
};
