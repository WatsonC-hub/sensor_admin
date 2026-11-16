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
