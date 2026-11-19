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

export type TypeFieldKind =
  | 'text'
  | 'number'
  | 'select'
  | 'boolean'
  | 'date'
  /** A feltgruppe: a list of rows with their own fields (e.g. geologi layers). */
  | 'group'
  /** The id of another feltobservation (e.g. a ledning's brønd). */
  | 'relation';

/**
 * One choice in a select typefelt: `value` is stored, `label` is shown. Append-only like
 * typefelter: a value never changes and is never reused, but its label can be renamed.
 */
export type SelectOption = {value: string; label: string};

/**
 * One typefelt. Append-only: a key and its kind never change. Removing a field sets
 * `archived`, which hides it for new data but keeps existing values valid.
 */
export type TypeField = {
  key: string;
  label: string;
  kind: TypeFieldKind;
  options?: SelectOption[] | null;
  archived?: boolean;
  /** number: the value must be greater than this. */
  min_exclusive?: number | null;
  /** number inside a feltgruppe: must grow from row to row (e.g. a layer's bottom). */
  increasing?: boolean;
  /** group: the feltgruppe's key and its fields (copied in by the server). */
  group?: string | null;
  fields?: TypeField[] | null;

  /** relation: schema_keys of the observationstyper it may point to. */
  target_types?: string[] | null;
};

/** A style rule: the first one that matches a feltobservation's typefelt sets its look. */
export type StyleRule = {
  field: string;
  equals?: unknown;
  empty?: boolean;
  notEmpty?: boolean;
  color?: string;
  icon?: string;
  label?: string;
};

/** Map style of an observationstype (`observation_type.style`). */
export type TypeStyle = {
  icon?: string;
  color?: string;
  defaultLabel?: string;
  /** Key of the typefelt shown as a label on the map; none means no labels for the type. */
  labelField?: string;
  weight?: number;
  dashArray?: string;
  fillOpacity?: number;
  rules?: StyleRule[];
};

export type ObservationType = {
  id: number;
  schema_key: string;
  name: string;
  icon: string | null;
  color: string | null;
  geometry_types: string[] | null;
  /** Missing on devices that fetched types before typefelter existed. */
  fields?: TypeField[];
  /** Missing on devices that fetched types before styles existed. */
  style?: TypeStyle;
};

export type ImportFeature = {
  type: 'Feature';
  /** The feature's index in the file. Parts of a multi-geometry share it. */
  id: number;
  geometry: Geometry;
  properties: Record<string, unknown>;
};

/** Leaflet path options for a projektlag. */
export type LayerStyle = {
  color?: string;
  weight?: number;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
};

/** Reference data for one projekt (e.g. a projekt area): shown on the map, never registered. */
export type ProjectLayer = {
  id: string;
  project_no: string;
  name: string;
  style: LayerStyle;
  feature_count: number;
  created_at: string;
  features: {
    type: 'FeatureCollection';
    features: {type: 'Feature'; geometry: Geometry; properties: Record<string, unknown>}[];
  };
};

export type ImportParseResponse = {
  layers: string[];
  layer: string;
  columns: {name: string; kind: TypeFieldKind}[];
  features: {type: 'FeatureCollection'; features: ImportFeature[]};
  skipped: {index: number; reason: string}[];
  /** A style found in the file (QGIS style in a GeoPackage), for projektlag. */
  style: LayerStyle | null;
};

export type Project = {
  project_no: string;
  project_title: string | null;
};

export type OverfoerselMode = 'auto' | 'manual';

export type Meta =
  /** The server's pull cursor (opaque). A number is from before the snapshot cursor. */
  | {key: 'cursor'; value: string | number}
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
  cursor: string;
  has_more: boolean;
};
