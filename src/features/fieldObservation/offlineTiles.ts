import L from 'leaflet';
import {
  downloadTile,
  getBlobByKey,
  getStorageLength,
  getTileUrl,
  hasTile,
  saveTile,
  tileLayerOffline,
  truncate,
} from 'leaflet.offline';

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
/**
 * Zoom levels above the current view that are also fetched, so zooming out a little still
 * shows the area. Each level up has a quarter of the tiles, so together they add about a third.
 */
const OVERVIEW_LEVELS = 4;
/** Refuse bigger downloads in the spike: about 1 GB of tiles. */
export const MAX_TILES = 40_000;
/** Measured over Aarhus, z14–18: 18–36 KB per tile. */
const AVERAGE_TILE_BYTES = 28 * 1024;

/** How many levels up to look for a stored tile to enlarge when a tile is missing. */
const MAX_FALLBACK_LEVELS = 8;

/** Where a shown tile came from. */
type TileSource = 'enhed' | 'net' | `zoom ${number}`;

/**
 * Debug aid: with localStorage `luftfotoDebug` set to "1", each tile is outlined and labelled
 * with where it came from (enhed = stored on the device, net = fetched, zoom N = a stored
 * coarser tile enlarged). The source is always on the tile as `data-source` as well.
 */
const isDebug = () => {
  try {
    return localStorage.getItem('luftfotoDebug') === '1';
  } catch {
    return false;
  }
};

const storageKey = (coords: {x: number; y: number; z: number}) => getTileUrl(LUFTFOTO_URL, coords);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    // Tiles are fetched with CORS, like the stored ones were.
    image.crossOrigin = '';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Kunne ikke hente ${src}`));
    image.src = src;
  });

const loadStored = async (key: string) => {
  const url = URL.createObjectURL(await getBlobByKey(key));
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
};

/**
 * Luftfoto tiles: the stored tile if there is one, else from the network, and when neither
 * works (offline, or zoomed in deeper than was downloaded) the nearest stored coarser tile,
 * enlarged. Drawn on a canvas so part of a coarser tile can be shown.
 */
class LuftfotoLayer extends L.TileLayer {
  override createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('canvas');
    const size = this.getTileSize();
    tile.width = size.x;
    tile.height = size.y;

    const draw = (image: HTMLImageElement, source: TileSource, levelsUp = 0) => {
      const context = tile.getContext('2d');
      if (!context) return;
      // The part of the coarser tile that covers this one.
      const part = image.naturalWidth / 2 ** levelsUp;
      const offset = (value: number) => (value % 2 ** levelsUp) * part;
      context.drawImage(
        image,
        offset(coords.x),
        offset(coords.y),
        part,
        part,
        0,
        0,
        size.x,
        size.y
      );
      tile.dataset.source = source;
      if (isDebug()) {
        context.strokeStyle = source === 'enhed' ? 'lime' : source === 'net' ? 'cyan' : 'orange';
        context.lineWidth = 3;
        context.strokeRect(0, 0, size.x, size.y);
        context.font = 'bold 14px sans-serif';
        context.fillStyle = 'white';
        context.fillText(`${coords.z}: ${source}`, 8, 20);
      }
    };

    const fromCoarser = async () => {
      for (let up = 1; up <= MAX_FALLBACK_LEVELS && coords.z - up >= 0; up++) {
        const key = storageKey({x: coords.x >> up, y: coords.y >> up, z: coords.z - up});
        // oxlint-disable-next-line no-await-in-loop -- nearest level first, stop at the first hit
        if (await hasTile(key)) {
          // oxlint-disable-next-line no-await-in-loop
          draw(await loadStored(key), `zoom ${coords.z - up}`, up);
          return;
        }
      }
      throw new Error('Ingen gemt luftfoto her');
    };

    const load = async () => {
      const key = storageKey(coords);
      if (await hasTile(key)) return draw(await loadStored(key), 'enhed');
      if (navigator.onLine) {
        try {
          return draw(await loadImage(this.getTileUrl(coords)), 'net');
        } catch {
          // Fall through to a coarser stored tile.
        }
      }
      return fromCoarser();
    };

    // On zoom, Leaflet drops every old-zoom tile that is not `complete` (TileLayer._abortLoading),
    // a property only <img> has. Without it the old tiles vanish at once and the map flashes
    // grey until the new ones are drawn; with it they stay until the new level has loaded.
    const finish = (error?: Error) => {
      Object.assign(tile, {complete: true});
      done(error, tile);
    };
    load().then(() => finish(), finish);
    return tile;
  }
}

const LUFTFOTO_OPTIONS: L.TileLayerOptions = {
  attribution: '&copy; Klimadatastyrelsen / GeoDanmark',
  maxZoom: 22,
  maxNativeZoom: NATIVE_MAX_ZOOM,
  // Tiles must be fetched with CORS: an opaque response cannot be stored as a blob.
  crossOrigin: true,
};

export const createLuftfotoLayer = (): L.TileLayer =>
  new LuftfotoLayer(LUFTFOTO_URL, LUFTFOTO_OPTIONS);

/** One layer, only used to compute tile urls and storage keys; never added to a map. */
let planner: TileLayerOffline | null = null;
const getPlanner = () => (planner ??= tileLayerOffline(LUFTFOTO_URL, LUFTFOTO_OPTIONS));

export type MapView = {bounds: L.LatLngBounds; zoom: number};

const pixelBounds = (area: L.LatLngBounds, zoom: number) =>
  L.bounds(
    L.CRS.EPSG3857.latLngToPoint(area.getNorthWest(), zoom),
    L.CRS.EPSG3857.latLngToPoint(area.getSouthEast(), zoom)
  );

/** How many 256 px tiles cover `area` at `zoom`, counted as leaflet.offline's getTileUrls picks them. */
const countTiles = (area: L.LatLngBounds, zoom: number) => {
  const {min, max} = pixelBounds(area, zoom);
  if (!min || !max) return 0;
  const columns = Math.floor(max.x / 256) - Math.floor(min.x / 256) + 1;
  const rows = Math.floor(max.y / 256) - Math.floor(min.y / 256) + 1;
  return columns * rows;
};

/** Ground size of one pixel at `zoom` and `latitude`, in cm (web mercator, 256 px tiles). */
const centimetresPerPixel = (zoom: number, latitude: number) =>
  (100 * 156_543.03 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;

/** The ortofoto's own resolution; a finer zoom level only enlarges the same pixels. */
const PHOTO_CENTIMETRES = 12.5;

export type DetailOption = {
  /** The deepest zoom level downloaded. */
  maxZoom: number;
  /** Tiles for every level from the plan's minZoom to maxZoom. */
  tiles: number;
};

export type DownloadPlan = {
  area: L.LatLngBounds;
  minZoom: number;
  /**
   * One option per possible deepest level, from the current view's zoom down to the last level
   * that still adds detail to the photo.
   */
  options: DetailOption[];
  /** Current zoom + 1 (a bit sharper than what is on screen), or the largest that fits. */
  defaultMaxZoom: number;
};

/**
 * The choices for downloading the area on screen: always the few levels above the view, and
 * down to a chosen level of detail, so a small area is not fetched far deeper than needed.
 */
export const planDownload = ({bounds, zoom}: MapView): DownloadPlan => {
  const viewZoom = Math.min(Math.round(zoom), NATIVE_MAX_ZOOM);
  const minZoom = Math.max(0, viewZoom - OVERVIEW_LEVELS);
  const latitude = bounds.getCenter().lat;
  const options: DetailOption[] = [];
  let tiles = 0;
  for (let level = minZoom; level <= NATIVE_MAX_ZOOM; level++) {
    const addsDetail = centimetresPerPixel(level, latitude) >= PHOTO_CENTIMETRES;
    if (level > viewZoom && !addsDetail) break;
    tiles += countTiles(bounds, level);
    if (level >= viewZoom) options.push({maxZoom: level, tiles});
  }
  const fitting = options.filter((option) => option.tiles <= MAX_TILES);
  const wanted = Math.min(viewZoom + 1, options.at(-1)?.maxZoom ?? viewZoom);
  const defaultMaxZoom = fitting.some((option) => option.maxZoom === wanted)
    ? wanted
    : (fitting.at(-1)?.maxZoom ?? viewZoom);
  return {area: bounds, minZoom, options, defaultMaxZoom};
};

/** How to show a level's tile in a detail preview: the image and where it sits in the frame. */
export type DetailPreview = {url: string; size: number; left: number; top: number};

/**
 * A preview of what `level` looks like when zoomed in to `referenceZoom`: the same small spot
 * near the area's centre, cut from the level's tile and enlarged. `frame` is the preview's
 * size in CSS px, shown 1:1 at the reference zoom. The spot is the centre of a reference-zoom
 * tile, so at every coarser level it lies well inside one tile.
 */
export const detailPreview = (
  area: L.LatLngBounds,
  level: number,
  referenceZoom: number,
  frame: number
): DetailPreview => {
  const crs = L.CRS.EPSG3857;
  const centre = crs.latLngToPoint(area.getCenter(), referenceZoom);
  const spot = centre.divideBy(256).floor().add([0.5, 0.5]).multiplyBy(256);
  const scale = 2 ** (referenceZoom - level);
  const point = spot.divideBy(scale);
  const tile = point.divideBy(256).floor();
  const inTile = point.subtract(tile.multiplyBy(256));
  return {
    url: getTileUrl(LUFTFOTO_URL, {x: tile.x, y: tile.y, z: level}),
    size: 256 * scale,
    left: frame / 2 - inTile.x * scale,
    top: frame / 2 - inTile.y * scale,
  };
};

/** The tiles covering the plan's area at every zoom from its minZoom to `maxZoom`. */
export const planTiles = (plan: DownloadPlan, maxZoom: number): TileInfo[] => {
  const layer = getPlanner();
  const tiles: TileInfo[] = [];
  for (let zoom = plan.minZoom; zoom <= maxZoom; zoom++) {
    tiles.push(...layer.getTileUrls(pixelBounds(plan.area, zoom), zoom));
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
        // Sequential per worker on purpose: six workers cap the requests in flight.
        // oxlint-disable-next-line no-await-in-loop
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
