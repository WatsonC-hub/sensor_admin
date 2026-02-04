import {SvgIconProps} from '@mui/material';
import {Dayjs} from 'dayjs';
import {ReactNode} from 'react';
// import type {FeatureCollection, Geometry} from 'leaflet';
import * as geojson from 'geojson';

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Image {
  type: string;
  gid: number;
  loc_id?: number;
  boreholeno: number;
  title: string;
  date: Dayjs;
  public: boolean;
  userid: number;
  comment: string;
  imageurl: string;
  organisationid?: number;
}

export interface BoreholeMapData {
  boreholeno: string;
  latitude: number;
  longitude: number;
  intakeno: number[];
  plantname: string;
  plantid: number;
  drilldepth: number;
  description: string;
  municipal: string | null;
  measurement: number[];
  status: number[];
  timeofmeas: string[];
  calypso_id: number[];
  num_controls_in_a_year: number[];
  groups: Group[];
}

// example data

export interface BoreholeData {
  boreholeno: string;
  intakeno: number;
  drilldepth: number | null;
  elevation: number | null;
  latitude: number;
  longitude: number;
  municipal: string | null;
  comments: string | null;
  plantid: number | null;
  plantname: string | null;
  timeofmeas: string | null;
  measurement: number | null;
  description: string | null;
  num_controls_in_a_year: number | null;
  calypso_id: number | null;
  status: number;
  groups: Group[];
}

export type Kontrol = {
  comment: string;
  gid: number;
  disttowatertable_m: number;
  timeofmeas: Dayjs;
  useforcorrection: number;
  pumpstop: Dayjs | null;
  service: boolean;
  organisationid: number;
  organisationname: string;
  uploaded_status: boolean;
  display_name?: string;
  extrema?: string | null;
};

export type BoreholeMeasurement = {
  boreholeno: string;
  intakeno: number;
  timeofmeas: Dayjs;
  disttowatertable_m: number;
  deleted: boolean;
  extrema: string | null;
  gid: number;
  last_uploaded: string;
  organisationid: number;
  organisationname: string;
  pumpstop: Dayjs | null;
  service: boolean;
  updated_at: string;
  uploaded_status: boolean;
  useforcorrection: number;
  userid: number;
  uuid: string;
  waterlevel?: number | null;
  display_name?: string;
  comment: string;
};

export type BoreholeMeasurementAPI = {
  boreholeno: string;
  intakeno: number;
  timeofmeas: string;
  disttowatertable_m: number;
  deleted: boolean;
  extrema: string | null;
  gid: number;
  last_uploaded: string;
  organisationid: number;
  organisationname: string;
  pumpstop: string | null;
  service: boolean;
  updated_at: string;
  uploaded_status: boolean;
  useforcorrection: number;
  userid: number;
  uuid: string;
  waterlevel?: number | null;
  display_name?: string;
  comment: string;
};

export type MaalepunktTableData = {
  startdate: string;
  enddate: string;
  elevation: number;
  organisationid: number;
  organisationname: string;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
  display_name?: string;
};

export type Maalepunkt = {
  startdate: Dayjs;
  enddate: Dayjs;
  elevation: number;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
  display_name?: string;
};

export type MaalepunktPost = {
  startdate: Dayjs;
  enddate: Dayjs;
  elevation: number | null;
  mp_description: string | undefined;
  gid: number;
};

export type TilsynItem = {
  batteriskift: boolean;
  dato: string;
  gid: number;
  kommentar?: string | undefined;
  tilsyn: boolean;
  display_name?: string;
};

export type PejlingItem = {
  comment: string;
  gid: number;
  measurement: number | null;
  referenced_measurement: number | null;
  timeofmeas: string;
  useforcorrection: number;
  display_name: string | null;
  pumpstop: string | null;
  service: boolean | null;
  extrema: string | null;
};

export type Parking = {
  parking_id: number;
  loc_id: number;
  x: number;
  y: number;
};

type RouteProperties = {loc_id: number; id: number; comment: string | null; type: 'walk' | 'drive'};

export type RouteFeature = geojson.Feature<geojson.Geometry, RouteProperties>;

export type Group = {
  id: string;
  group_name: string;
  new?: boolean;
};

export type SimpleItinerary = {
  name: string;
  assigned_to_name: string | null;
  due_date: string | null;
  id: string | null;
};

export type ContactInfo = {
  id: string;
  name: string;
  mobile?: string | null;
  email: string | null;
  comment?: string;
  contact_role: number;
  user_id?: string | null;
  loc_id?: number;
  org?: string;
  contact_type: string;
  notify_required?: boolean;
};

export type ContactTable = {
  id: string;
  name: string;
  mobile: string | null;
  email: string | null;
  contact_role?: number | undefined;
  comment?: string;
  user_id?: string | null;
  org: string;
  relation_id: number;
  contact_type?: string | undefined;
  contact_role_name?: string;
  notify_required?: boolean;
};

export type Access = {
  id?: number;
  navn?: string;
  type?: string;
  placering?: string;
  koden?: string;
  contact_id?: string | null;
  kommentar?: string;
  contact_name?: string;
  email?: string;
  org_name?: string;
};

export type AccessTable = {
  id: number;
  navn: string;
  type: string;
  placering: string;
  contact_id: string;
  koden: string;
  kommentar: string;
  contact_name?: string;
};

export type BatteryStatusType = {
  current_bat: number | null;
  usage_pr_day: number | null;
  battery_percentage: number;
  estimated_no_battery: string;
  is_powered: boolean;
};

export type LatestMeasurement = {
  timeofmeas: string;
  rawMeasurement: number | null;
  measurement: number;
  rawMeasurementUnit: string | null;
};

// type AlgorithmParams = {
//   type: 'number' | 'string' | 'boolean';
//   name: string;
//   min: number;
//   max: number;
// };

export type QaAlgorithms = {
  gid: number;
  algorithm: string;
  parameters: QaAlgorithmParameters[];
  name: string | null;
  days_to_include: number | null;
  active: boolean;
  exclude: Array<number> | null;
  parameter_values: Record<string, any>;
  disabled: boolean;
  description: string;
  runs_as_qa_algorithm: boolean;
};

export type QaAlgorithmParameters = {
  label: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  min?: number;
  max?: number;
  nullable?: boolean;
  name: string;
  options?: Array<{label: string; value: string}>;
};

export type QaAlgorithmsPut = {
  algorithm: string;
  parameters: Record<string, any>;
  disabled: boolean;
};

export type LevelCorrection = {
  gid: number;
  ts_id: number;
  updated_at: string;
  userid: number;
  date: string;
  comment: string;
};

export type DataExclude = {
  gid: number;
  ts_id: number;
  updated_at: string;
  userid: number;
  min_value: number;
  max_value: number;
  startdate: string;
  enddate: string;
  comment: string;
};

export type MinMaxCutoff = {
  gid: number;
  ts_id: number;
  updated_at: string;
  userid: number;
  mincutoff: number;
  maxcutoff: number;
};

export type QaAllData = {
  levelcorrection: Array<LevelCorrection>;
  min_max_cutoff: MinMaxCutoff;
  dataexclude: Array<DataExclude>;
};

export type GraphData = {
  x: Array<string>;
  y: Array<number>;
};

export type QaGraphLabel = {
  gid: number;
  ts_id: number;
  startdate: string;
  enddate: string;
  algorithm: string;
  label_id: number;
  name: string;
};

export type DialAction = {
  key: string;
  icon: React.ReactElement<SvgIconProps>;
  tooltip?: ReactNode;
  onClick: () => void;
  color: string;
  toastTip: string;
  dialog?: boolean;
};

type TaskContact = {
  id: string;
  navn: string;
  telefonnummer: Optional[string];
  email: Optional[string];
  loc_ids: Array<number>;
  loc_names: Array<string>;
};

type TaskLocationAccess = {
  id: number;
  name: string;
  physical_location: string;
  loc_ids: Array<number>;
  loc_names: Array<string>;
};

export type TaskCollection = {
  contacts: Array<TaskContact>;
  location_access: Array<TaskLocationAccess>;
  ressourcer: Array<TaskRessources>;
  units: Array<TaskUnits>;
  tasks: Array<LocationTasks>;
};

export type TaskRessources = {
  kategori: string;
  navn: string;
};

export type TaskUnits = {
  count: number;
  terminal_name: string;
  sensor_names: Array<string>;
};

export type LocationTasks = {
  count: number;
  name: string;
  blocks_notifications: Array<number>;
  tstype_name: string;
  link_name: Array<string>;
  ts_ids: Array<number>;
};

export type DataToShow = {
  Algoritmer: boolean;
  Kontrolmålinger: boolean;
  Godkendt: boolean;
  Nedbør: boolean;
  'Horisontale linjer': boolean;
  'Korrigerede spring': boolean;
  'Valide værdier': boolean;
  'Fjernet data': boolean;
  Rådata: boolean;
  Jupiter: boolean;
  'Alarm niveauer': boolean;
};

type HorizontalLine = {
  name: string;
  level: number;
  unit: string;
  parameter: string;
  tstype_id: number;
  line?: object;
  mode?: string;
};

export type DmpSyncValidCombination = {
  loctype_id: number;
  tstype_id: number;
};
