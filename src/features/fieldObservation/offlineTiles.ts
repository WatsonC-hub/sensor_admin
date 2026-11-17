import L from 'leaflet';
import {downloadTile, getStorageLength, saveTile, tileLayerOffline, truncate} from 'leaflet.offline';

import type {TileInfo, TileLayerOffline} from 'leaflet.offline';

/**
 * SPIKE: Luftfoto (the newest spring ortofoto) as tiles that can be downloaded for an area
 * and shown offline. Uses Dataforsyningen's web mercator WMTS, not the per-year WMS, because
 * fixed tiles can be stored and reused; arbitrary WMS images cannot.
 * Tiles are stored in IndexedDB by leaflet.offline (database "leaflet.offline").
 */

// Public token, also used by Explorer's client.
export const DATAFORSYNINGEN_TOKEN = 'eaca82e1cb411d78e841c7eba8ec1bbc';

// The token is part of each tile's storage key: a new token orphans the stored tiles.
const LUFTFOTO_URL =
  'https://api.dataforsyningen.dk/orto_foraar_webm_DAF?service=WMTS&request=GetTile' +
  '&version=1.0.0&layer=orto_foraar_webm&style=default&format=image/jpeg' +
  '&tilematrixset=DFD_GoogleMapsCompatible&tilematrix={z}&tilerow={y}&tilecol={x}' +
  `&token=${DATAFORSYNINGEN_TOKEN}`;

/** The WMTS has levels 0–20; above that Leaflet scales level 20 up. */
const NATIVE_MAX_ZOOM = 20;
export const DOWNLOAD_MIN_ZOOM = 10;
export const DOWNLOAD_MAX_ZOOM = 18;
/** Refuse bigger downloads in the spike: about 1 GB of tiles. */
export const MAX_TILES = 40_000;
/** Measured over Aarhus, z14–18: 18–36 KB per tile. */
const AVERAGE_TILE_BYTES = 28 * 1024;

export const createLuftfotoLayer = () =>
  tileLayerOffline(LUFTFOTO_URL, {
    attribution: '&copy; Klimadatastyrelsen / GeoDanmark',
    maxZoom: 22,
    maxNativeZoom: NATIVE_MAX_ZOOM,
    // Tiles must be fetched with CORS: an opaque response cannot be stored as a blob.
    crossOrigin: true,
  });

/** One layer, only used to compute tile urls and storage keys; never added to a map. */
let planner: TileLayerOffline | null = null;
const getPlanner = () => (planner ??= createLuftfotoLayer());

/** The tiles covering `area` at every zoom from minZoom to maxZoom. */
export const planDownload = (
  area: L.LatLngBounds,
  minZoom = DOWNLOAD_MIN_ZOOM,
  maxZoom = DOWNLOAD_MAX_ZOOM
): TileInfo[] => {
  const layer = getPlanner();
  const crs = L.CRS.EPSG3857;
  const tiles: TileInfo[] = [];
  for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
    const pixels = L.bounds(
      crs.latLngToPoint(area.getNorthWest(), zoom),
      crs.latLngToPoint(area.getSouthEast(), zoom)
    );
    tiles.push(...layer.getTileUrls(pixels, zoom));
  }
  return tiles;
};

export const estimateBytes = (tileCount: number) => tileCount * AVERAGE_TILE_BYTES;

export type DownloadProgress = {done: number; failed: number; total: number};

/**
 * Download and store the tiles, six at a time. Stops early when the signal aborts;
 * tiles already stored stay. A failed tile is counted and skipped.
 */
export const downloadTiles = async (
  tiles: TileInfo[],
  onProgress: (progress: DownloadProgress) => void,
  signal: AbortSignal
) => {
  const progress: DownloadProgress = {done: 0, failed: 0, total: tiles.length};
  let next = 0;
  const worker = async () => {
    while (next < tiles.length && !signal.aborted) {
      const tile = tiles[next++];
      try {
        await saveTile(tile, await downloadTile(tile.url));
        progress.done++;
      } catch {
        progress.failed++;
      }
      onProgress({...progress});
    }
  };
  await Promise.all(Array.from({length: 6}, worker));
  return progress;
};

export const getStoredTileCount = () => getStorageLength();

export const clearStoredTiles = () => truncate();

/**
 * Ask the browser not to evict our storage under pressure. Granted silently or not at all;
 * Safari grants it more readily for an installed (home screen) app.
 */
export const requestPersistentStorage = async () => {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
};

export const formatMegabytes = (bytes: number) =>
  `${Math.round(bytes / (1024 * 1024)).toLocaleString('da-DK')} MB`;
