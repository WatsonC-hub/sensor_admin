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
};

export type Measurement = {
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
  waterlevel?: boolean;
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
};

export type Maalepunkt = {
  startdate: string;
  enddate: string;
  elevation: number;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
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
  measurement: number;
  timeofmeas: string;
  useforcorrection: number;
  disttowatertable_m?: number | null;
  pumpstop?: string | null;
  extrema?: string | null;
  service?: boolean;
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
  email: string;
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

export type Unit = {
  terminal_type: string;
  terminal_id: string;
  sensor_id: string;
  sensorinfo: string;
  calypso_id: string;
  batteriskift: string;
  startdato: string;
  slutdato: string;
  uuid: string;
  gid: number;
  channel: string;
};

export type typeUnitPost = {
  unit_uuid: string;
  startdate: string;
  enddate: string;
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
