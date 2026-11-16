import L from 'leaflet';

/**
 * A WMS layer that requests one image for the whole viewport instead of many tiles.
 * It suits GC2/MapServer, which renders a whole map per request: one request per pan
 * or zoom, and labels are not cut at tile edges.
 *
 * Ported from web_projects (src/components/Map.tsx, L.SingleTileWMSLayer). Two <img>
 * elements are swapped, so the old image stays until the new one has loaded.
 */
export type SingleTileWmsOptions = {
  layers: string;
  format?: string;
  transparent?: boolean;
  version?: string;
  styles?: string;
  pane?: string;
  zIndex?: number;
  /** Any other WMS parameters (e.g. filters). */
  params?: Record<string, string | number | boolean>;
};

export class SingleTileWms extends L.Layer {
  private readonly url: string;
  private readonly wmsParams: Record<string, string | number | boolean>;
  private zIndex: number;
  private images: [HTMLImageElement, HTMLImageElement] | null = null;
  /** Index of the image currently shown. */
  private visible = 0;
  private shownBounds: L.LatLngBounds | null = null;
  private pendingBounds: L.LatLngBounds | null = null;

  constructor(url: string, options: SingleTileWmsOptions) {
    super();
    // L.Layer has no initialize(), so options passed to super() would be dropped.
    L.setOptions(this, {pane: options.pane ?? 'overlayPane'});
    this.url = url;
    this.zIndex = options.zIndex ?? 1;
    this.wmsParams = {
      service: 'WMS',
      request: 'GetMap',
      version: options.version ?? '1.3.0',
      layers: options.layers,
      styles: options.styles ?? '',
      format: options.format ?? 'image/png',
      transparent: options.transparent ?? true,
      ...options.params,
    };
  }

  onAdd(map: L.Map) {
    const projectionKey = parseFloat(String(this.wmsParams.version)) >= 1.3 ? 'crs' : 'srs';
    this.wmsParams[projectionKey] = map.options.crs?.code ?? 'EPSG:3857';
    const pane = this.getPane();
    this.images = [this.createImage(0, pane), this.createImage(1, pane)];
    map.on('moveend', this.requestImage);
    // A zoom changes the scale and pixel origin; hide until the new image arrives.
    map.on('zoomstart zoomanim', this.hideImages);
    this.requestImage();
    return this;
  }

  onRemove(map: L.Map) {
    map.off('moveend', this.requestImage);
    map.off('zoomstart zoomanim', this.hideImages);
    this.images?.forEach((image) => image.remove());
    this.images = null;
    return this;
  }

  setZIndex(zIndex: number) {
    this.zIndex = zIndex;
    this.images?.forEach((image) => (image.style.zIndex = String(zIndex)));
    return this;
  }

  private createImage(index: number, pane: HTMLElement | undefined) {
    const image = L.DomUtil.create('img', 'leaflet-image-layer') as HTMLImageElement;
    image.style.visibility = 'hidden';
    image.style.zIndex = String(this.zIndex);
    image.alt = '';
    image.onload = () => this.onImageLoad(index);
    pane?.appendChild(image);
    return image;
  }

  /** Ask for one image covering the current viewport, into the hidden image. */
  private requestImage = () => {
    const map = this._map;
    if (!map || !this.images) return;
    const bounds = map.getBounds();
    const crs = map.options.crs ?? L.CRS.EPSG3857;
    const nw = crs.project(bounds.getNorthWest());
    const se = crs.project(bounds.getSouthEast());
    const size = map.getSize();
    const params = {...this.wmsParams, width: size.x, height: size.y};
    const bbox = [nw.x, se.y, se.x, nw.y].join(',');
    this.pendingBounds = bounds;
    const next = this.images[1 - this.visible];
    next.src = this.url + L.Util.getParamString(params, this.url) + '&bbox=' + bbox;
  };

  private onImageLoad(index: number) {
    if (!this.images || index === this.visible) return;
    this.images[index].style.visibility = '';
    this.images[this.visible].style.visibility = 'hidden';
    this.visible = index;
    this.shownBounds = this.pendingBounds;
    this.position();
  }

  /** Place the shown image on its geographic bounds. */
  private position() {
    const map = this._map;
    if (!map || !this.images || !this.shownBounds) return;
    const image = this.images[this.visible];
    const topLeft = map.latLngToLayerPoint(this.shownBounds.getNorthWest());
    const size = map.latLngToLayerPoint(this.shownBounds.getSouthEast()).subtract(topLeft);
    L.DomUtil.setPosition(image, topLeft);
    image.style.width = `${size.x}px`;
    image.style.height = `${size.y}px`;
    image.style.visibility = '';
  }

  private hideImages = () => {
    this.images?.forEach((image) => (image.style.visibility = 'hidden'));
  };
}
