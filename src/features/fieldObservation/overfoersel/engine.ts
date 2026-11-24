// Overførsel is sequential on purpose: one request at a time on a slow connection,
// photos in order, and reads and writes inside a transaction in order.
// oxlint-disable no-await-in-loop
import {isAxiosError} from 'axios';

import {
  getChanges,
  getProjects,
  getTypes,
  pushBatch,
  uploadImage,
} from '~/features/fieldObservation/overfoersel/api';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import {queryClient} from '~/queryClient';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {
  LocalImage,
  LocalObservation,
  ServerImage,
  ServerObservation,
  SyncResult,
} from '~/features/fieldObservation/types';

/**
 * One overførsel run: push metadata, push photo bytes, then pull.
 * Throws on the first network failure, so the controller can count it.
 * `refreshReferenceData` fetches projekter, observationstyper and the shown projektlag even if
 * they are recent.
 */
export const runOverfoersel = async (
  db: FieldObservationDb,
  {refreshReferenceData = false}: {refreshReferenceData?: boolean} = {}
) => {
  await pushMetadata(db);
  await pushPhotos(db);
  await pull(db, refreshReferenceData);
  await refreshProjectLayers(refreshReferenceData);
  await refreshVectorLayers(refreshReferenceData);
};

/**
 * Projektlag are not part of the pull: they are fetched by the map's query, for the chosen projekt
 * only. A forced run (app open, Overfør nu) fetches them now; an automatic run only once they are
 * stale, since a projektlag can be large. A failure is left to the query, not counted as a failed
 * run.
 */
const refreshProjectLayers = async (force: boolean) => {
  const queryKey = queryKeys.fieldObservationProjectLayers();
  if (force) await queryClient.invalidateQueries({queryKey});
  else await queryClient.refetchQueries({queryKey, type: 'active', stale: true});
};

/**
 * GIS layers saved on the device as vector data are fetched by the map's queries, for the chosen
 * projekt and the layers that are on. A forced run (app open, Overfør nu) fetches them again now;
 * an automatic run only once they are a day old. Failures show on the layer in Kortlag.
 */
const refreshVectorLayers = async (force: boolean) => {
  const queryKey = queryKeys.fieldObservationVectorLayer();
  if (force) await queryClient.invalidateQueries({queryKey});
  else await queryClient.refetchQueries({queryKey, type: 'active', stale: true});
};

const BATCH_SIZE = 200;

const clean = {dirty: 0 as const, sync_error: null};

const fromServerObservation = (row: ServerObservation, localRev: number): LocalObservation => ({
  ...row,
  ...clean,
  local_rev: localRev,
});

const fromServerImage = (row: ServerImage, local: LocalImage | undefined): LocalImage => ({
  ...row,
  ...clean,
  local_rev: local?.local_rev ?? 0,
  data: local?.data ?? null,
  bytes_uploaded: 1,
});

const rejectedReason = (result: SyncResult<unknown>) =>
  result.status === 'forbidden'
    ? 'Du har ikke rettigheder til projektet'
    : (result.detail ?? 'Afvist af serveren');

/** Pass 1: all changed metadata in as few requests as possible. */
const pushMetadata = async (db: FieldObservationDb) => {
  const observations = await db.observations.where('dirty').equals(1).toArray();
  // Photo metadata can only be pushed once the photo row exists on the server.
  const images = await db.images
    .where('dirty')
    .equals(1)
    .filter((image) => image.bytes_uploaded === 1)
    .toArray();

  for (let start = 0; start < Math.max(observations.length, images.length); start += BATCH_SIZE) {
    const sentObservations = observations.slice(start, start + BATCH_SIZE);
    const sentImages = images.slice(start, start + BATCH_SIZE);
    const response = await pushBatch(sentObservations, sentImages);

    await db.transaction('rw', db.observations, db.images, async () => {
      for (const result of response.observations) {
        const sent = sentObservations.find((o) => o.id === result.id);
        const current = await db.observations.get(result.id);
        if (!sent || !current) continue;
        const editedSinceSent = current.local_rev !== sent.local_rev;

        if (result.status === 'applied' || result.status === 'stale') {
          if (!result.row) continue;
          if (editedSinceSent) {
            // Keep the newer local edit; it goes out on the next run.
            await db.observations.update(result.id, {version: result.row.version});
          } else {
            // Stale means the server has a newer edit: take the server's row.
            await db.observations.put(fromServerObservation(result.row, current.local_rev));
          }
        } else if (!editedSinceSent) {
          await db.observations.update(result.id, {dirty: -1, sync_error: rejectedReason(result)});
        }
      }

      for (const result of response.images) {
        const sent = sentImages.find((i) => i.id === result.id);
        const current = await db.images.get(result.id);
        if (!sent || !current || current.local_rev !== sent.local_rev) continue;
        if ((result.status === 'applied' || result.status === 'stale') && result.row) {
          await db.images.put(fromServerImage(result.row, current));
        } else if (result.status === 'forbidden' || result.status === 'invalid') {
          await db.images.update(result.id, {dirty: -1, sync_error: rejectedReason(result)});
        }
      }
    });
  }
};

/** Pass 2: photo bytes, one per request, oldest first. */
const pushPhotos = async (db: FieldObservationDb) => {
  const pending = await db.images.where('bytes_uploaded').equals(0).sortBy('created_at');

  for (const image of pending) {
    const observation = await db.observations.get(image.observation_id);
    // Never uploaded and no longer wanted: the server never had it, so drop it here.
    if (image.deleted_at || !observation || observation.deleted_at) {
      await db.images.delete(image.id);
      continue;
    }
    if (image.data === null || image.dirty === -1) continue;
    // The photo's row needs its feltobservation on the server first.
    if (observation.version === null) continue;

    let row: ServerImage;
    try {
      row = await uploadImage({...image, data: image.data});
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) continue;
      if (isAxiosError(error) && error.response?.status === 403) {
        await db.images.update(image.id, {dirty: -1, sync_error: 'Ingen rettigheder'});
        continue;
      }
      throw error;
    }

    await db.transaction('rw', db.images, async () => {
      const current = await db.images.get(image.id);
      if (!current) return;
      if (current.local_rev === image.local_rev) {
        await db.images.put(fromServerImage(row, current));
      } else {
        // Edited during the upload: the bytes are there, the new metadata goes in pass 1.
        await db.images.update(image.id, {
          bytes_uploaded: 1,
          s3_key: row.s3_key,
          version: row.version,
        });
      }
    });
  }
};

const REFERENCE_DATA_MAX_AGE_MS = 60 * 60 * 1000;

/**
 * Projekter and observationstyper rarely change, so automatic runs fetch them at most hourly.
 * `force` (app opened, or Overfør pressed) fetches them anyway, so a new projekt shows at once.
 */
const refreshReferenceData = async (db: FieldObservationDb, force: boolean) => {
  const stored = await db.meta.get('referenceDataAt');
  const fetchedAt = stored?.key === 'referenceDataAt' ? stored.value : 0;
  const fresh = Date.now() - fetchedAt < REFERENCE_DATA_MAX_AGE_MS;
  const storedTypes = await db.types.toArray();
  // Types stored before typefelter or styles existed lack them; fetch them again at once.
  const complete = storedTypes.every((type) => Array.isArray(type.fields) && type.style);
  if (!force && fresh && storedTypes.length > 0 && complete) return;
  const [projects, types] = await Promise.all([getProjects(), getTypes()]);
  await db.transaction('rw', db.projects, db.types, db.meta, async () => {
    await db.projects.clear();
    await db.projects.bulkPut(projects);
    await db.types.clear();
    await db.types.bulkPut(types);
    await db.meta.put({key: 'referenceDataAt', value: Date.now()});
  });
  // GIS layers saved for a projekt the user no longer has would only take space.
  await db.vectorLayers
    .where('project_no')
    .noneOf(projects.map((project) => project.project_no))
    .delete();
};

/** Fetch everything that changed on the server since the last cursor. */
const pull = async (db: FieldObservationDb, forceReferenceData: boolean) => {
  await refreshReferenceData(db, forceReferenceData);

  // The cursor is the server's (transaction snapshots, so no row is skipped). A number is
  // from the old version cursor: pull everything once; local unsent edits still win.
  const stored = (await db.meta.get('cursor'))?.value;
  let cursor = typeof stored === 'string' ? stored : '';
  let hasMore = true;
  while (hasMore) {
    const changes = await getChanges(cursor);
    await db.transaction('rw', db.observations, db.images, db.meta, async () => {
      for (const row of changes.observations) {
        const local = await db.observations.get(row.id);
        // A local edit that is not sent yet (or was rejected) wins locally; the server
        // decides when it is pushed again.
        if (local && local.dirty !== 0) continue;
        await db.observations.put(fromServerObservation(row, local?.local_rev ?? 0));
      }
      for (const row of changes.images) {
        const local = await db.images.get(row.id);
        if (local && local.dirty !== 0) continue;
        await db.images.put(fromServerImage(row, local));
      }
      await db.meta.put({key: 'cursor', value: changes.cursor});
    });
    cursor = changes.cursor;
    hasMore = changes.has_more;
  }
};
