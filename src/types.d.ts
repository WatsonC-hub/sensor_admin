import {
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodNullable,
  ZodNumber,
  ZodOptional,
  ZodOptionalDef,
  ZodRawShape,
  ZodString,
  ZodTypeAny,
} from 'zod';

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
  batteriskift?: boolean;
  dato: string;
  gid: number;
  kommentar?: string | undefined;
  tilsyn?: boolean;
  user_id?: string | null;
};

export type ZodTilsynItem = {
  batteriskift?: ZodOptional<ZodBoolean>;
  dato: ZodDate;
  gid: ZodNumber;
  kommentar?: ZodString;
  tilsyn?: ZodOptional<ZodBoolean>;
  user_id?: ZodNullable<ZodString>;
};
