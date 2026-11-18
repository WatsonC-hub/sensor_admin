import type {Geometry} from '~/features/fieldObservation/types';

/** Small geometry helpers on GeoJSON coordinates ([lng, lat], EPSG:4326). */

type Position = number[];

const EARTH_RADIUS_M = 6_371_000;
const toRad = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceM = (a: Position, b: Position) => {
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

/** Compass bearing from a to b in degrees: 0 = north, 90 = east. */
export const bearingDeg = (a: Position, b: Position) => {
  const y = Math.sin(toRad(b[0] - a[0])) * Math.cos(toRad(b[1]));
  const x =
    Math.cos(toRad(a[1])) * Math.sin(toRad(b[1])) -
    Math.sin(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.cos(toRad(b[0] - a[0]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const DIRECTIONS = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'];

/** E.g. "NØ (47°)". */
export const directionText = (degrees: number) =>
  `${DIRECTIONS[Math.round(degrees / 45) % 8]} (${Math.round(degrees)}°)`;

/** Every vertex of a geometry. */
export const vertices = (geom: Geometry): Position[] => {
  switch (geom.type) {
    case 'Point':
      return [geom.coordinates];
    case 'LineString':
      return geom.coordinates;
    case 'Polygon':
      return geom.coordinates.flat();
  }
};

/** The shortest distance between any two vertices: good enough to rank nearby features. */
export const vertexDistanceM = (a: Geometry, b: Geometry) =>
  Math.min(...vertices(a).flatMap((p) => vertices(b).map((q) => distanceM(p, q))));

/**
 * A line's direction, from the end nearest `anchor` (e.g. its brønd) to the other end.
 * Without an anchor, from the first point drawn to the last.
 */
export const lineDirection = (line: Extract<Geometry, {type: 'LineString'}>, anchor?: Position) => {
  const first = line.coordinates[0];
  const last = line.coordinates[line.coordinates.length - 1];
  if (!first || !last) return null;
  const reversed = anchor !== undefined && distanceM(last, anchor) < distanceM(first, anchor);
  return reversed ? bearingDeg(last, first) : bearingDeg(first, last);
};

/** The point halfway along a line, measured by length (not the middle vertex). */
export const lineMidpoint = (coordinates: Position[]): Position | null => {
  const first = coordinates[0];
  if (!first) return null;
  const lengths = coordinates.slice(1).map((point, i) => distanceM(coordinates[i], point));
  let remaining = lengths.reduce((sum, length) => sum + length, 0) / 2;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] && lengths[i] > 0) {
      const t = remaining / lengths[i];
      const [a, b] = [coordinates[i], coordinates[i + 1]];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    remaining -= lengths[i];
  }
  return first;
};

/**
 * A point that is always inside a polygon (also a concave one or one with holes), for a label:
 * the middle of the widest stretch inside it, on a horizontal line through its middle.
 */
export const polygonInsidePoint = (rings: Position[][]): Position | null => {
  const outer = rings[0];
  if (!outer?.length) return null;
  const lats = outer.map((point) => point[1]);
  const y = (Math.min(...lats) + Math.max(...lats)) / 2;
  const crossings: number[] = [];
  for (const ring of rings) {
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length];
      if (a[1] > y !== b[1] > y)
        crossings.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    });
  }
  crossings.sort((a, b) => a - b);
  let best: Position | null = null;
  let widest = -1;
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    const width = crossings[i + 1] - crossings[i];
    if (width > widest) {
      widest = width;
      best = [(crossings[i] + crossings[i + 1]) / 2, y];
    }
  }
  return best ?? outer[0];
};

/** Where a line or flade shows its type's badge; null for a point (the point is the badge). */
export const badgePosition = (geom: Geometry): Position | null => {
  switch (geom.type) {
    case 'Point':
      return null;
    case 'LineString':
      return lineMidpoint(geom.coordinates);
    case 'Polygon':
      return polygonInsidePoint(geom.coordinates);
  }
};
