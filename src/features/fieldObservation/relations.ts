import {lineDirection, vertexDistanceM} from '~/features/fieldObservation/geo';

import type {
  Geometry,
  LocalObservation,
  ObservationType,
  TypeField,
} from '~/features/fieldObservation/types';

/**
 * Relations between feltobservationer (see the spec): a `relation` typefelt on the "many"
 * side holds the id of the one it points to. The other direction is always computed.
 */

export type RelationCandidate = {id: string; label: string; distance: number};

/** How close (m) a line's end must be to a point to count as connected to it. */
const SNAP_DISTANCE_M = 2;

const typeKeys = (types: ObservationType[]) => new Map(types.map((type) => [type.id, type]));

/** The feltobservationer a relation field may point to, nearest first. */
export const relationCandidates = (
  field: TypeField,
  geom: Geometry | undefined,
  selfId: string | null,
  observations: LocalObservation[],
  types: ObservationType[]
): RelationCandidate[] => {
  const byId = typeKeys(types);
  return observations
    .filter((observation) => {
      const type = byId.get(observation.type_id);
      return (
        !observation.deleted_at &&
        observation.id !== selfId &&
        type !== undefined &&
        (field.target_types ?? []).includes(type.schema_key)
      );
    })
    .map((observation) => {
      const distance = geom ? vertexDistanceM(geom, observation.geom) : Infinity;
      const name = byId.get(observation.type_id)?.name ?? 'Feltobservation';
      const note = observation.note ? ` – ${observation.note.slice(0, 30)}` : '';
      const away = Number.isFinite(distance) ? ` (${Math.round(distance)} m væk)` : '';
      return {id: observation.id, label: `${name}${note}${away}`, distance};
    })
    .sort((a, b) => a.distance - b.distance);
};

/** For a new line: relation fields filled in with what its ends touch (e.g. a snapped brønd). */
export const touchingRelations = (
  fields: TypeField[],
  geom: Geometry,
  observations: LocalObservation[],
  types: ObservationType[]
) => {
  const values: Record<string, string> = {};
  for (const field of fields) {
    if (field.kind !== 'relation' || field.archived) continue;
    const [nearest] = relationCandidates(field, geom, null, observations, types);
    if (nearest && nearest.distance <= SNAP_DISTANCE_M) values[field.key] = nearest.id;
  }
  return values;
};

export type LinkedObservation = {
  observation: LocalObservation;
  typeName: string;
  /** Direction from the linked-to feltobservation outwards, for lines. */
  direction: number | null;
};

/** The feltobservationer whose relation fields point to `target` (e.g. a brønd's ledninger). */
export const linkedTo = (
  target: LocalObservation,
  observations: LocalObservation[],
  types: ObservationType[]
): LinkedObservation[] => {
  const byId = typeKeys(types);
  const anchor = target.geom.type === 'Point' ? target.geom.coordinates : undefined;
  return observations.flatMap((observation) => {
    if (observation.deleted_at || observation.id === target.id) return [];
    const type = byId.get(observation.type_id);
    const points = (type?.fields ?? []).some(
      (field) => field.kind === 'relation' && observation.properties[field.key] === target.id
    );
    if (!type || !points) return [];
    const direction =
      observation.geom.type === 'LineString' ? lineDirection(observation.geom, anchor) : null;
    return [{observation, typeName: type.name, direction}];
  });
};

/** A line's direction, measured from the feltobservation its relation field points to. */
export const directionFromRelation = (
  geom: Geometry,
  properties: Record<string, unknown>,
  fields: TypeField[],
  observations: LocalObservation[]
) => {
  if (geom.type !== 'LineString') return null;
  const relation = fields.find((field) => field.kind === 'relation');
  const targetId = relation ? properties[relation.key] : undefined;
  const target = observations.find((observation) => observation.id === targetId);
  const anchor = target?.geom.type === 'Point' ? target.geom.coordinates : undefined;
  return {direction: lineDirection(geom, anchor), fromRelation: anchor !== undefined};
};
