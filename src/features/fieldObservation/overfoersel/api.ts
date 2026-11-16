import {apiClient} from '~/apiClient';

import type {
  ChangesResponse,
  LocalImage,
  LocalObservation,
  ObservationType,
  Project,
  ServerImage,
  SyncResponse,
} from '~/features/fieldObservation/types';

/**
 * HTTP calls for overførsel. Every call has a hard timeout: on a slow connection
 * a request that never finishes is worse than one that fails.
 */

const METADATA_TIMEOUT_MS = 15_000;
const PING_TIMEOUT_MS = 5_000;
// Assume at least ~10 kB/s for photos, and never less than 30 s.
const photoTimeout = (bytes: number) => Math.max(30_000, bytes / 10);

const toObservationPayload = (o: LocalObservation) => ({
  id: o.id,
  project_no: o.project_no,
  type_id: o.type_id,
  geom: o.geom,
  position_accuracy_m: o.position_accuracy_m,
  note: o.note,
  internal_note: o.internal_note,
  properties: o.properties,
  custom_fields: o.custom_fields,
  created_at: o.created_at,
  updated_at: o.updated_at,
  deleted_at: o.deleted_at,
});

const toImageMetaPayload = (i: LocalImage) => ({
  id: i.id,
  observation_id: i.observation_id,
  note: i.note,
  taken_at: i.taken_at,
  updated_at: i.updated_at,
  deleted_at: i.deleted_at,
});

export const pushBatch = async (observations: LocalObservation[], images: LocalImage[]) => {
  const {data} = await apiClient.post<SyncResponse>(
    '/field_observation/sync',
    {
      observations: observations.map(toObservationPayload),
      images: images.map(toImageMetaPayload),
    },
    {timeout: METADATA_TIMEOUT_MS}
  );
  return data;
};

export const uploadImage = async (image: LocalImage & {data: ArrayBuffer}) => {
  const form = new FormData();
  form.append('file', new Blob([image.data], {type: image.mime_type}), `${image.id}.jpg`);
  form.append('created_at', image.created_at);
  form.append('updated_at', image.updated_at);
  if (image.note) form.append('note', image.note);
  if (image.taken_at) form.append('taken_at', image.taken_at);
  const {data} = await apiClient.put<{row: ServerImage}>(
    `/field_observation/${image.observation_id}/image/${image.id}`,
    form,
    {timeout: photoTimeout(image.data.byteLength)}
  );
  return data.row;
};

export const getChanges = async (cursor: string) => {
  const {data} = await apiClient.get<ChangesResponse>('/field_observation/changes', {
    params: {cursor},
    timeout: METADATA_TIMEOUT_MS,
  });
  return data;
};

export const getProjects = async () => {
  const {data} = await apiClient.get<Project[]>('/field_observation/projects', {
    timeout: METADATA_TIMEOUT_MS,
  });
  return data;
};

export const getTypes = async () => {
  const {data} = await apiClient.get<ObservationType[]>('/field_observation/types', {
    timeout: METADATA_TIMEOUT_MS,
  });
  return data;
};

/** Round-trip time in ms, or null if the server did not answer in time. */
export const ping = async (): Promise<number | null> => {
  const start = performance.now();
  try {
    await apiClient.get('/field_observation/ping', {timeout: PING_TIMEOUT_MS});
    return performance.now() - start;
  } catch {
    return null;
  }
};
