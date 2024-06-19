export interface Image {
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
}

export type Maalepunkt = {
  startdate: string;
  enddate: string;
  elevation: number;
  mp_description: string;
  gid: number;
  ts_id: number;
  userid: string;
};
