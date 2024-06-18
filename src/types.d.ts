import {ZodBoolean, ZodDate, ZodNullable, ZodNumber, ZodString} from 'zod';

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
