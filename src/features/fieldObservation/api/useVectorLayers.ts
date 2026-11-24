import {useQueries} from '@tanstack/react-query';
import {isAxiosError} from 'axios';
import {useLiveQuery} from 'dexie-react-hooks';
import {useEffect, useMemo, useRef} from 'react';

import {apiClient} from '~/apiClient';
import {useGisLayers} from '~/features/fieldObservation/api/useGisLayers';
import {vertices} from '~/features/fieldObservation/geo';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import useOnlineStatus from '~/hooks/useOnlineStatus';

import type {GisLayer} from '~/features/fieldObservation/api/useGisLayers';
import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {Geometry, VectorLayerCache} from '~/features/fieldObservation/types';

/**
 * GIS layers fetched as vector data for the chosen projekt's area from our API, stored on the
 * device and drawn on canvas, so they also show offline. Every layer the catalog marks `offline`
 * (python_api field_observation/gis_layers.py); the rest stay WMS, online only.
 */

/** Around the projekt's feltobservationer and projektlag, so the edges are covered too. */
const BUFFER_M = 500;

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

type FeaturesResponse = {
  layer_id: string;
  feature_count: number;
  truncated: boolean;
  features: GeoJSON.FeatureCollection;
};

/** The API's `detail` for a failed request (the body is text, as requested), if any. */
const apiDetail = (error: unknown) => {
  const body: unknown = isAxiosError(error) ? error.response?.data : undefined;
  if (typeof body !== 'string') return undefined;
  try {
    const {detail} = JSON.parse(body) as {detail?: unknown};
    return typeof detail === 'string' ? detail : undefined;
  } catch {
    return undefined;
  }
};

/** The layer's features in the bbox, cut to it, with the columns its styling reads. */
const fetchVectorLayer = async (
  db: FieldObservationDb,
  layer: GisLayer,
  projectNo: string,
  bbox: Bbox
) => {
  let text: string;
  try {
    const response = await apiClient.get<string>(
      `/field_observation/gis-layers/${encodeURIComponent(layer.id)}/features`,
      {params: {bbox: bbox.join(',')}, responseType: 'text', timeout: 120_000}
    );
    text = response.data;
  } catch (error) {
    throw new Error(apiDetail(error) ?? `${layer.title} kunne ikke hentes`, {cause: error});
  }
  const body = JSON.parse(text) as FeaturesResponse;

  const record: VectorLayerCache = {
    key: cacheKey(layer.id, projectNo),
    layer_id: layer.id,
    project_no: projectNo,
    bbox,
    fetched_at: new Date().toISOString(),
    feature_count: body.feature_count,
    bytes: text.length,
    truncated: body.truncated,
    style: layer.style ?? undefined,
    features: body.features,
  };
  await db.vectorLayers.put(record);
  return record.fetched_at;
};

/** Whether a GIS layer that is on is saved on the device for the projekt, and if not, why. */
export type VectorLayerStatus =
  /** A raster, a cascaded WMS or tagged no-wfs in GC2: WMS only, so not shown offline. */
  | {state: 'online-only'}
  /** The catalog isn't loaded (yet), and nothing is saved. */
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
  const {data: catalog} = useGisLayers();
  const byId = useMemo(
    () => (catalog ? new Map(catalog.map((layer) => [layer.id, layer])) : null),
    [catalog]
  );
  const suitable = activeLayerIds
    .map((id) => byId?.get(id))
    .filter((layer): layer is GisLayer => layer?.offline === true);

  // A layer turned off loses its saved copies (every projekt's): it would only take space, and
  // turning it on again fetches it anew. Only a change while the page is open counts, so the
  // stored list arriving after the first render deletes nothing.
  const previousActive = useRef<string[] | null>(null);
  useEffect(() => {
    const previous = previousActive.current;
    previousActive.current = activeLayerIds;
    const removed = previous?.filter((id) => !activeLayerIds.includes(id)) ?? [];
    if (removed.length > 0) {
      void db.vectorLayers
        .where('key')
        .startsWithAnyOf(removed.map((id) => `${id}|`))
        .delete();
    }
  }, [db, activeLayerIds]);

  const results = useQueries({
    queries: suitable.map((layer) => ({
      queryKey: queryKeys.fieldObservationVectorLayer(
        layer.id,
        projectNo ?? '',
        bbox?.join(',') ?? ''
      ),
      queryFn: () => fetchVectorLayer(db, layer, projectNo!, bbox!),
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
    () => stored.filter((record) => !byId || byId.get(record.layer_id)?.offline === true),
    [stored, byId]
  );

  const statuses: Record<string, VectorLayerStatus> = {};
  for (const layerId of activeLayerIds) {
    const record = records.find((item) => item.layer_id === layerId) ?? null;
    const index = suitable.findIndex((layer) => layer.id === layerId);
    const query = index >= 0 ? results[index] : undefined;
    if (query?.isFetching) {
      statuses[layerId] = {state: 'saving', record};
    } else if (query?.isError) {
      statuses[layerId] = {state: 'error', record, message: query.error.message};
    } else if (record) {
      statuses[layerId] = {state: 'saved', record};
    } else if (byId && index < 0) {
      statuses[layerId] = {state: 'online-only'};
    } else if (!byId) {
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
