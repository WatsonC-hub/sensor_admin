import Dexie from 'dexie';

import type {EntityTable} from 'dexie';
import type {
  LocalImage,
  LocalObservation,
  Meta,
  ObservationType,
  Project,
  ProjectLayer,
  VectorLayerCache,
} from '~/features/fieldObservation/types';

/**
 * The device's copy of feltobservationer. It is the source of truth for the
 * /observation page: the UI reads and writes only here, and overførsel moves
 * changes to and from the server in the background.
 */
export class FieldObservationDb extends Dexie {
  observations!: EntityTable<LocalObservation, 'id'>;
  images!: EntityTable<LocalImage, 'id'>;
  projects!: EntityTable<Project, 'project_no'>;
  types!: EntityTable<ObservationType, 'id'>;
  meta!: EntityTable<Meta, 'key'>;
  /** Projektlag fetched for the projekter the user has chosen, so they also show offline. */
  projectLayers!: EntityTable<ProjectLayer, 'id'>;
  /** SPIKE: GIS layers as vector data for a projekt's area, so they also show offline. */
  vectorLayers!: EntityTable<VectorLayerCache, 'key'>;

  constructor(name: string) {
    super(name);
    this.version(1).stores({
      observations: 'id, dirty, project_no',
      images: 'id, observation_id, dirty, bytes_uploaded, created_at',
      projects: 'project_no',
      types: 'id',
      meta: 'key',
    });
    this.version(2).stores({projectLayers: 'id, project_no'});
    this.version(3).stores({vectorLayers: 'key, project_no'});
  }
}

const databases = new Map<string, FieldObservationDb>();

/** One database per user, so a shared device never mixes two users' unsent work. */
export const getFieldObservationDb = (userId: string) => {
  let db = databases.get(userId);
  if (!db) {
    db = new FieldObservationDb(`fieldObservation_${userId}`);
    databases.set(userId, db);
  }
  return db;
};
