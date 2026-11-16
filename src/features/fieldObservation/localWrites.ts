import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {Geometry, LocalImage, LocalObservation} from '~/features/fieldObservation/types';

/** Every write on the device goes through here: it is instant and never touches the network. */

const now = () => new Date().toISOString();

export type ObservationFields = Pick<
  LocalObservation,
  'type_id' | 'project_no' | 'note' | 'internal_note' | 'properties'
>;

const newObservation = (
  geom: Geometry,
  positionAccuracy: number | null,
  fields: ObservationFields,
  customFields: unknown[] = []
): LocalObservation => {
  const time = now();
  return {
    id: crypto.randomUUID(),
    geom,
    position_accuracy_m: positionAccuracy,
    custom_fields: customFields,
    ...fields,
    created_at: time,
    updated_at: time,
    created_by: null,
    updated_by: null,
    deleted_at: null,
    version: null,
    dirty: 1,
    local_rev: 1,
    sync_error: null,
  };
};

export const createObservation = async (
  db: FieldObservationDb,
  geom: Geometry,
  positionAccuracy: number | null,
  fields: ObservationFields
) => {
  const observation = newObservation(geom, positionAccuracy, fields);
  await db.observations.add(observation);
  return observation.id;
};

/** Many at once (import), in one transaction: either all are saved or none. */
export const createObservations = async (
  db: FieldObservationDb,
  items: {geom: Geometry; fields: ObservationFields; customFields: unknown[]}[]
) => {
  const observations = items.map((item) =>
    newObservation(item.geom, null, item.fields, item.customFields)
  );
  await db.observations.bulkAdd(observations);
  return observations.map((observation) => observation.id);
};

const touch = <T extends {local_rev: number}>(row: T) => ({
  updated_at: now(),
  dirty: 1 as const,
  local_rev: row.local_rev + 1,
  sync_error: null,
});

export const updateObservation = async (
  db: FieldObservationDb,
  id: string,
  fields: Partial<ObservationFields & {geom: Geometry}>
) => {
  await db.transaction('rw', db.observations, async () => {
    const row = await db.observations.get(id);
    if (!row) return;
    // A moved geometry no longer has the GPS accuracy it was captured with.
    const accuracy = fields.geom ? {position_accuracy_m: null} : {};
    await db.observations.update(id, {...fields, ...accuracy, ...touch(row)});
  });
};

export const deleteObservation = async (db: FieldObservationDb, id: string) => {
  await db.transaction('rw', db.observations, async () => {
    const row = await db.observations.get(id);
    if (!row) return;
    // Always a tombstone: version is still null when a push committed but its reply was
    // lost, so deleting only locally could let the server copy come back on the next pull.
    // Its photos that were never uploaded are dropped by the next overførsel.
    await db.observations.update(id, {deleted_at: now(), ...touch(row)});
  });
};

export const addImage = async (
  db: FieldObservationDb,
  observationId: string,
  photo: {data: ArrayBuffer; mime: string; takenAt: string | null},
  note: string | null
) => {
  const time = now();
  const image: LocalImage = {
    id: crypto.randomUUID(),
    observation_id: observationId,
    s3_key: null,
    mime_type: photo.mime,
    note,
    taken_at: photo.takenAt,
    created_at: time,
    updated_at: time,
    created_by: null,
    updated_by: null,
    deleted_at: null,
    version: null,
    data: photo.data,
    bytes_uploaded: 0,
    dirty: 1,
    local_rev: 1,
    sync_error: null,
  };
  await db.images.add(image);
  return image.id;
};

export const updateImageNote = async (db: FieldObservationDb, id: string, note: string | null) => {
  await db.transaction('rw', db.images, async () => {
    const row = await db.images.get(id);
    if (!row) return;
    await db.images.update(id, {note, ...touch(row)});
  });
};

export const deleteImage = async (db: FieldObservationDb, id: string) => {
  await db.transaction('rw', db.images, async () => {
    const row = await db.images.get(id);
    if (!row) return;
    // Always a tombstone: the upload may be in flight. A photo that was never uploaded
    // is dropped by the next overførsel; one that was gets its deletion pushed.
    await db.images.update(id, {deleted_at: now(), ...touch(row)});
  });
};
