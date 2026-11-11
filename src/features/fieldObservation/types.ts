export type Geometry =
  | {type: 'Point'; coordinates: [number, number] | [number, number, number]}
  | {type: 'LineString'; coordinates: number[][]}
  | {type: 'Polygon'; coordinates: number[][][]};

/**
 * Local state of a row:
 * - 0: the same as on the server
 * - 1: changed on the device, not overført yet
 * - -1: rejected by the server (no rights or invalid). Auto skips it; an edit or a press on
 *   Overfør retries it.
 */
export type DirtyState = 0 | 1 | -1;

type LocalSyncFields = {
  dirty: DirtyState;
  /** Increased on every local edit, so an edit made during a push is not lost. */
  local_rev: number;
  /** Why the server rejected the row, when dirty is -1. */
  sync_error: string | null;
};

export type ServerObservation = {
  id: string;
  project_no: string | null;
  type_id: number;
  geom: Geometry;
  position_accuracy_m: number | null;
  note: string | null;
  internal_note: string | null;
  properties: Record<string, unknown>;
  custom_fields: unknown[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  /** Server version; null until the server has the row. */
  version: number | null;
};

export type LocalObservation = ServerObservation & LocalSyncFields;

export type ServerImage = {
  id: string;
  observation_id: string;
  s3_key: string | null;
  mime_type: string;
  note: string | null;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  version: number | null;
};

export type LocalImage = ServerImage &
  LocalSyncFields & {
    /** The photo bytes, kept for photos taken on this device. ArrayBuffer, not Blob (WebKit bug 235687). */
    data: ArrayBuffer | null;
    /** 1 once the server has the bytes and the row. */
    bytes_uploaded: 0 | 1;
  };

export type ObservationType = {
  id: number;
  schema_key: string;
  name: string;
  icon: string | null;
  color: string | null;
  geometry_types: string[] | null;
};

export type Project = {
  project_no: string;
  project_title: string | null;
};

export type OverfoerselMode = 'auto' | 'manual';

export type Meta =
  | {key: 'cursor'; value: number}
  | {key: 'mode'; value: OverfoerselMode}
  /** When projekter and observationstyper were last fetched (ms since epoch). */
  | {key: 'referenceDataAt'; value: number};

export type SyncStatus = 'applied' | 'stale' | 'forbidden' | 'invalid' | 'pending_upload';

export type SyncResult<T> = {
  id: string;
  status: SyncStatus;
  row: T | null;
  detail: string | null;
};

export type SyncResponse = {
  observations: SyncResult<ServerObservation>[];
  images: SyncResult<ServerImage>[];
};

export type ChangesResponse = {
  observations: ServerObservation[];
  images: ServerImage[];
  cursor: number;
  has_more: boolean;
};
