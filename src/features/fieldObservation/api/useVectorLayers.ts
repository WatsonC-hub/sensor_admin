import {useQueries} from '@tanstack/react-query';
import axios from 'axios';
import {useLiveQuery} from 'dexie-react-hooks';
import {useMemo} from 'react';

import {EXPLORER_BASE} from '~/features/fieldObservation/api/useGisLayers';
import {vertices} from '~/features/fieldObservation/geo';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import useOnlineStatus from '~/hooks/useOnlineStatus';

import type L from 'leaflet';
import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {Geometry, VectorLayerCache} from '~/features/fieldObservation/types';

/**
 * SPIKE (2026-11-23): GIS layers fetched as vector data for the projekt's area, stored on the
 * device and drawn on canvas, so they also show offline. Only the layers listed here; every other
 * GIS layer stays WMS. Timings are logged to the console with the "[vektorlag]" prefix.
 */
export const VECTOR_LAYERS: Record<string, {columns: string[]; style: L.PathOptions}> = {
  'datagrundlag.matrikel_lodflade': {
    columns: ['matrikelnummer', 'ejerlavsnavn'],
    style: {color: '#e65100', weight: 1, opacity: 0.9, fill: false},
  },
};

/** Around the projekt's feltobservationer and projektlag, so the edges are covered too. */
const BUFFER_M = 500;
/** More than this is cut off (and logged); a projekt that big needs another approach. */
const MAX_FEATURES = 20_000;
/** The layer's geometries are stored in this SRID in GC2 (datagrundlag is EPSG:25832). */
const LAYER_SRID = 25832;

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

const fetchVectorLayer = async (
  db: FieldObservationDb,
  layerId: string,
  projectNo: string,
  bbox: Bbox
) => {
  const {columns} = VECTOR_LAYERS[layerId];
  // Only numbers and the fixed layer config go into the SQL.
  const envelope = `ST_Transform(ST_MakeEnvelope(${bbox.map((value) => value.toFixed(6)).join(', ')}, 4326), ${LAYER_SRID})`;
  const q =
    `SELECT gid, ${columns.join(', ')}, the_geom FROM ${layerId} ` +
    `WHERE the_geom && ${envelope} LIMIT ${MAX_FEATURES + 1}`;

  const started = performance.now();
  const response = await axios.get<string>(`${EXPLORER_BASE}/gc2/api/v1/sql/watsonc`, {
    params: {q, srs: 4326},
    responseType: 'text',
    timeout: 120_000,
  });
  const fetchedMs = performance.now() - started;
  const body = JSON.parse(response.data) as {
    success?: boolean;
    message?: string;
    features?: GeoJSON.Feature[];
  };
  if (!body.success || !body.features) {
    throw new Error(body.message ?? `${layerId} kunne ikke hentes`);
  }
  const truncated = body.features.length > MAX_FEATURES;
  const features = truncated ? body.features.slice(0, MAX_FEATURES) : body.features;

  const record: VectorLayerCache = {
    key: cacheKey(layerId, projectNo),
    layer_id: layerId,
    project_no: projectNo,
    bbox,
    fetched_at: new Date().toISOString(),
    feature_count: features.length,
    bytes: response.data.length,
    truncated,
    features: {type: 'FeatureCollection', features},
  };
  const storeStarted = performance.now();
  await db.vectorLayers.put(record);
  const storedMs = performance.now() - storeStarted;

  // SPIKE: the numbers are what the spike is for.
  // oxlint-disable-next-line no-console
  console.info(
    `[vektorlag] ${layerId} for ${projectNo}: ${features.length} features` +
      `${truncated ? ' (CUT OFF)' : ''}, ${(record.bytes / 1e6).toFixed(1)} MB, ` +
      `fetch ${Math.round(fetchedMs)} ms, store ${Math.round(storedMs)} ms`,
    bbox
  );
  return record.fetched_at;
};

/**
 * The vector GIS layers for the chosen projekt, from the device. While online, a layer that is on
 * is fetched for the projekt's area once a day, or when the area grows past the stored one.
 */
export const useVectorLayers = (
  db: FieldObservationDb,
  projectNo: string | null,
  extent: Geometry[],
  activeLayerIds: string[]
) => {
  const online = useOnlineStatus();
  const bbox = useMemo(() => extentBbox(extent), [extent]);
  const layerIds = activeLayerIds.filter((id) => id in VECTOR_LAYERS);

  useQueries({
    queries: layerIds.map((layerId) => ({
      queryKey: queryKeys.fieldObservationVectorLayer(
        layerId,
        projectNo ?? '',
        bbox?.join(',') ?? ''
      ),
      queryFn: () => fetchVectorLayer(db, layerId, projectNo!, bbox!),
      enabled: online && projectNo !== null && bbox !== null,
      staleTime: 24 * 60 * 60 * 1000,
      retry: 1,
    })),
  });

  return useLiveQuery(
    async () => {
      if (!projectNo || layerIds.length === 0) return [];
      const records = await db.vectorLayers.bulkGet(
        layerIds.map((layerId) => cacheKey(layerId, projectNo))
      );
      return records.filter((record): record is VectorLayerCache => record !== undefined);
    },
    [db, projectNo, layerIds.join(',')],
    []
  );
};
