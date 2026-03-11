import {Watlevmp} from '~/features/station/schema';
import {AddUnitType} from './forms/UnitForm';
import {AccessTable, ContactTable, Group} from '~/types';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';
import {LocationMetadata} from '~/hooks/query/useMetadata';

/*  FORMSTATE */
export type ControlSettingsFormState = {
  controls_per_year: number;
  lead_time: number | null;
  selectValue: 1 | 2;
};

export type SyncFormState = {
  dmp?:
    | {
        owner_cvr?: number;
        owner_name?: string;
      }
    | false
    | null;
  jupiter?: boolean | null;
};

export type CreateLocationData = {
  loc_name: string;
  loctype_id: number;
  terrainqual?: string;
  terrainlevel?: number;
  boreholeno?: string;
  suffix?: string;
  x: number;
  y: number;
  initial_project_no?: string;
  description?: string;
  groups?: Array<Group>;
};

type AddTimeseriesLocationData = LocationMetadata;

type VisibilityFormState = {
  requires_auth: boolean;
};

type SLA = {
  days_to_visitation: number;
};

type LocationFormState = {
  meta: CreateLocationData | AddTimeseriesLocationData;
  visibility?: VisibilityFormState;
  contacts?: ContactTable[];
  location_access?: AccessTable[];
  ressourcer?: Ressourcer[];
  sla?: SLA;
};

type TimeseriesFormState = {
  meta?: TimeseriesMeta;
  watlevmp?: Watlevmp;
  control_settings?: ControlSettingsFormState;
  sync?: SyncFormState;
  unit?: AddUnitType;
};

export type CreateStationFormState = {
  location: LocationFormState;
  timeseries: Record<string, TimeseriesFormState>;
};

export type SimpleContact = {
  name: string;
  email: string | null;
};

export type SimpleLocationAccess = {
  type: string;
  name: string;
};

export type TransformedUnit = AddUnitType & {
  tstype_id: number;
};

/* PAYLOAD TYPES */
export type TimeseriesMeta = {
  tstype_id: number;
  intakeno?: number;
  prefix?: string;
};

export type ControlSettingsPayload = {
  controls_per_year: number;
  lead_time: number | null;
};

export type TimeseriesPayload = {
  meta?: TimeseriesMeta;
  watlevmp?: Watlevmp;
  control_settings?: ControlSettingsPayload;
  sync?: SyncFormState;
  unit?: AddUnitType;
};

type LocationWithLocId = {
  loc_id: number;
};

export type CreateStationPayload = {
  location: LocationFormState | LocationWithLocId;
  timeseries: TimeseriesPayload[];
};
