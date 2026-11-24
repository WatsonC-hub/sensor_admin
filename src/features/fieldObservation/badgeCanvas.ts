import L from 'leaflet';

import {iconUrl} from '~/features/fieldObservation/styles';

/**
 * Feltobservation badges drawn on a canvas instead of as one HTML element each, so a map with
 * thousands of them stays fast to zoom. Looks like `markerHtml` (styles.ts): a round badge in the
 * style's colour, the icon in white, a white ring (dashed orange when not overført) and a shadow.
 */

/** Room around a badge for its shadow, in px. */
const SHADOW_PAD = 4;
const NOT_SENT_COLOR = '#ed6c02';

type IconState = {image: HTMLImageElement | null; ready: boolean; waiting: Set<() => void>};
const icons = new Map<string, IconState>();

// Firefox only draws an SVG on a canvas when the SVG has a width and height, which the icon files
// don't, so the file is read as text and given one.
const loadIcon = (url: string, state: IconState) => {
  const done = (image: HTMLImageElement | null) => {
    state.image = image;
    state.ready = true;
    state.waiting.forEach((callback) => callback());
    state.waiting.clear();
  };
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`${response.status}`);
      return response.text();
    })
    .then(
      (svg) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const tag = svg.slice(0, svg.indexOf('>'));
          const sized = /\swidth=/.test(tag)
            ? svg
            : svg.replace('<svg', '<svg width="48" height="48"');
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
        })
    )
    // A missing icon gives a badge without one rather than no badge.
    .then(done, () => done(null));
};

/** The icon image, or undefined while it loads; `onReady` is called once it has loaded. */
const iconImage = (icon: string, onReady: () => void) => {
  const url = iconUrl(icon);
  let state = icons.get(url);
  if (!state) {
    state = {image: null, ready: false, waiting: new Set()};
    icons.set(url, state);
    loadIcon(url, state);
  }
  if (state.ready) return state.image;
  state.waiting.add(onReady);
  return undefined;
};

const pixelRatio = () => Math.max(2, Math.ceil(window.devicePixelRatio || 1));

const renderBadge = (
  color: string,
  icon: HTMLImageElement | null,
  notSent: boolean,
  size: number
) => {
  const scale = pixelRatio();
  const full = size + 2 * SHADOW_PAD;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = Math.ceil(full * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.scale(scale, scale);
  const center = full / 2;
  const radius = size / 2;

  // The shadow isn't scaled with the context, so it is given in device pixels.
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 3 * scale;
  ctx.shadowOffsetY = scale;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(center, center, radius - 1, 0, 2 * Math.PI);
  ctx.lineWidth = 2;
  ctx.strokeStyle = notSent ? NOT_SENT_COLOR : '#fff';
  if (notSent) ctx.setLineDash([4, 3]);
  ctx.stroke();

  if (icon) {
    // The icon is a mask: paint its shape white on a canvas of its own, then put that on the badge.
    const iconSize = Math.round(size * 0.64);
    const tinted = document.createElement('canvas');
    tinted.width = tinted.height = iconSize * scale;
    const tint = tinted.getContext('2d');
    if (tint) {
      tint.drawImage(icon, 0, 0, tinted.width, tinted.height);
      tint.globalCompositeOperation = 'source-in';
      tint.fillStyle = '#fff';
      tint.fillRect(0, 0, tinted.width, tinted.height);
      ctx.drawImage(tinted, center - iconSize / 2, center - iconSize / 2, iconSize, iconSize);
    }
  }
  return canvas;
};

const badges = new Map<string, HTMLCanvasElement>();

/** A badge image (cached), or null while its icon loads; `onReady` is called once it can be drawn. */
const badgeImage = (badge: Badge, onReady: () => void) => {
  const key = `${badge.color}|${badge.icon}|${badge.notSent}|${badge.size}`;
  const cached = badges.get(key);
  if (cached) return cached;
  const icon = iconImage(badge.icon, onReady);
  if (icon === undefined) return null;
  const image = renderBadge(badge.color, icon, badge.notSent, badge.size);
  badges.set(key, image);
  return image;
};

export type Badge = {color: string; icon: string; notSent: boolean; size: number};

// Leaflet's canvas renderer internals that a badge draws with.
type CanvasRendererInternals = {_drawing: boolean; _ctx: CanvasRenderingContext2D | undefined};

/**
 * A badge on a canvas renderer (pass `renderer: L.canvas(...)`). It is a circle marker the size of
 * the badge, so clicks, snapping and redraws work as for any circle marker; only the drawing is
 * replaced.
 */
export class BadgeMarker extends L.CircleMarker {
  declare _renderer: CanvasRendererInternals | undefined;
  declare _point: L.Point;
  declare _empty: () => boolean;
  private readonly badge: Badge;

  constructor(latlng: L.LatLngExpression, badge: Badge, options: L.CircleMarkerOptions) {
    // The stroke isn't drawn; its weight makes room in the redraw area for the shadow.
    super(latlng, {...options, radius: badge.size / 2, stroke: false, weight: SHADOW_PAD});
    this.badge = badge;
  }

  // Called by the canvas renderer for each layer when it draws.
  _updatePath() {
    const renderer = this._renderer;
    const ctx = renderer?._ctx;
    if (!renderer?._drawing || !ctx || this._empty()) return;
    const image = badgeImage(this.badge, () => this.redraw());
    if (!image) return;
    const full = this.badge.size + 2 * SHADOW_PAD;
    ctx.drawImage(image, this._point.x - full / 2, this._point.y - full / 2, full, full);
  }
}
