import {SvgIconProps} from '@mui/material';
import {ReactNode} from 'react';
import {ZodBoolean, ZodDate, ZodNullable, ZodNumber, ZodString} from 'zod';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Image {
  type: string;
  gid: number;
  loc_id?: number;
  boreholeno: number;
  title: string;
  date: string;
  public: boolean;
  userid: number;
  comment: string;
  imageurl: string;
  organisationid?: number;
}

export type TableData = {
  ts_id: number;
  calypso_id: number;
  ts_name: string;
  tstype_name: string;
  customer_name: string;
  loc_id: number;
  color: string;
  opgave: string;
  active: boolean;
  flag: number;
  loctype_id: number;
  loc_name: string;
  prefix: string;
  calculated: boolean;
  x: number;
  y: number;
  notification_id: number;
};

export interface BoreholeMapData {
  boreholeno: string;
  latitude: number;
  longitude: number;
  intakeno: number[];
  plantname: string;
  plantid: number;
  drilldepth: number[];
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
  timeofmeas: string;
  useforcorrection: number;
  pumpstop: string;
  service: boolean;
  organisationid: number;
  organisationname: string;
  uploaded_status: boolean;
  display_name?: string;
};

export type BoreholeMeasurement = {
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
  startdate: string;
  enddate: string;
  elevation: number;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
  display_name?: string;
};

export type MaalepunktPost = {
  startdate: string;
  enddate: string;
  elevation: number;
  mp_description: string;
  gid: number;
};

export type TilsynItem = {
  batteriskift: boolean;
  dato: string;
  gid: number;
  kommentar?: string | undefined;
  tilsyn: boolean;
  user_id: string | null;
  display_name?: string;
};

export type ZodTilsynItem = {
  batteriskift: ZodBoolean;
  dato: ZodDate;
  gid: ZodNumber;
  kommentar?: ZodString;
  tilsyn: ZodBoolean;
  user_id: ZodNullable<ZodString>;
};

export type PejlingItem = {
  comment: string;
  gid: number;
  measurement: number | null;
  timeofmeas: string;
  useforcorrection: number;
  disttowatertable_m?: number | null;
  pumpstop?: string | null;
  extrema?: string | null;
  service?: boolean;
  display_name?: string;
};

export type Parking = {
  parking_id: number;
  loc_id: number;
  x: number;
  y: number;
};

export type LeafletMapRoute = {
  route_id: number;
  loc_id: number;
  geo_route: JSON | GeoJsonObject;
};

export type Group = {
  id: string;
  group_name: string;
  new?: boolean;
};

export type ContactInfo = {
  id?: string | null;
  navn: string;
  telefonnummer?: string | null;
  email: string | null;
  comment?: string;
  contact_role: number;
  user_id?: string | null;
  loc_id?: number;
  org?: str;
  contact_type: string;
};

export type baseContactInfo = {
  id?: string | null;
  navn: string;
  telefonnummer?: number;
  email: string;
};

export type ContactTable = {
  id: string;
  navn: string;
  telefonnummer: string | null;
  email: string;
  contact_role: number;
  comment?: string;
  user_id?: string | null;
  org: string;
  relation_id: number;
  contact_type: string;
  contact_role_name?: string;
};

export type ContactInfoOptions = {
  id?: string | null;
  navn: string;
  email: string;
  loc_id?: number;
};

export type StationDetails = {
  ressourcer: Array<Ressourcer>;
};

export type Access = {
  id?: number;
  navn?: string;
  type?: string;
  placering?: string;
  koden?: string;
  contact_id?: string | null;
  kommentar?: string;
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

export type QATableType = {
  ts_id: number;
  calypso_id?: number;
  ts_name: string;
  tstype_name;
};

export type BatteryStatusType = {
  current_bat: number;
  usage_pr_day: number;
  battery_percentage: number | null;
  estimated_no_battery: string;
  startdate: string;
  enddate: string;
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
  type: 'number' | 'string' | 'boolean';
  min: number;
  max: number;
  name: string;
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

export type FieldLocation = {
  loc_id?: number;
  loc_name: string;
  mainloc: string;
  subloc: string;
  subsubloc: string;
  x: number;
  y: number;
  groups: string[];
  terrainqual: string;
  terrainlevel: number;
  description: string;
  loctype_id: number;
  initial_project_no: string | null;
};

export type DialAction = {
  key: string;
  icon: React.ReactElement<SvgIconProps>;
  tooltip?: ReactNode;
  onClick: () => void;
  color: string;
  toastTip: string;
};
