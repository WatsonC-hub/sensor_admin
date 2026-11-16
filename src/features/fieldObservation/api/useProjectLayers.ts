import {queryOptions, skipToken, useMutation, useQuery} from '@tanstack/react-query';
import {useLiveQuery} from 'dexie-react-hooks';

import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';

import type {FieldObservationDb} from '~/features/fieldObservation/db';
import type {Geometry, LayerStyle, ProjectLayer} from '~/features/fieldObservation/types';

const LAYERS_URL = '/field_observation/layers';

/**
 * Fetches a projekt's projektlag and stores them on the device, replacing what was there.
 * The map reads them from the device, so they also show when offline.
 */
export const projectLayersQueryOptions = (db: FieldObservationDb, projectNo: string | null) =>
  queryOptions({
    queryKey: queryKeys.fieldObservationProjectLayers(projectNo ?? ''),
    queryFn: projectNo
      ? async () => {
          const {data} = await apiClient.get<ProjectLayer[]>(LAYERS_URL, {
            params: {project_no: projectNo},
          });
          await db.transaction('rw', db.projectLayers, async () => {
            await db.projectLayers.where('project_no').equals(projectNo).delete();
            await db.projectLayers.bulkPut(data);
          });
          return data.map((layer) => layer.id);
        }
      : skipToken,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

/** The chosen projekt's projektlag, from the device; refreshed from the server when online. */
export const useProjectLayers = (db: FieldObservationDb, projectNo: string | null) => {
  useQuery(projectLayersQueryOptions(db, projectNo));
  return useLiveQuery(
    () => (projectNo ? db.projectLayers.where('project_no').equals(projectNo).toArray() : []),
    [db, projectNo],
    []
  );
};

export type NewProjectLayer = {
  project_no: string;
  name: string;
  style: LayerStyle;
  features: {geometry: Geometry; properties: Record<string, unknown>}[];
};

export const useCreateProjectLayer = () =>
  useMutation({
    mutationFn: async (layer: NewProjectLayer) => {
      await apiClient.post(LAYERS_URL, {id: crypto.randomUUID(), ...layer}, {timeout: 120_000});
    },
    meta: {
      invalidates: [queryKeys.fieldObservationProjectLayers()],
      optOutGeneralInvalidations: true,
    },
  });

export const useDeleteProjectLayer = (db: FieldObservationDb) =>
  useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${LAYERS_URL}/${id}`);
      await db.projectLayers.delete(id);
    },
    meta: {
      invalidates: [queryKeys.fieldObservationProjectLayers()],
      optOutGeneralInvalidations: true,
    },
  });
