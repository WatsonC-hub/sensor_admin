import {Watlevmp} from '~/features/station/schema';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import {AddUnitType} from './forms/UnitForm';
import {AccessTable, ContactTable, Group} from '~/types';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';

/*  FORMSTATE */
export type ControlSettingsFormState = {
  controls_per_year: number;
  lead_time: number;
  selectValue: 1 | 2;
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

type AddTimeseriesLocationData = {
  loc_id: number;
  loctype_id: number;
  boreholeno?: string;
  loc_name: string;
};

type VisibilityFormState = {
  requires_auth: boolean;
  hide_public: boolean;
};

type LocationFormState = {
  meta: CreateLocationData | AddTimeseriesLocationData;
  contacts?: ContactTable[];
  location_access?: AccessTable[];
  ressourcer?: Ressourcer[];
};

export type CreateStationFormState = {
  location: LocationFormState;
  timeseries: Record<string, TimeseriesPayload>;
};

export type SimpleContact = {
  name: string;
  email: string;
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

export type TimeseriesPayload = {
  meta?: TimeseriesMeta;
  watlevmp?: Watlevmp;
  control_settings?: ControlSettingsFormState;
  sync?: SyncFormValues;
  unit?: AddUnitType;
  visibility?: VisibilityFormState;
};

type LocationWithLocId = {
  loc_id: number;
};

export type CreateStationPayload = {
  location: LocationFormState | LocationWithLocId;
  timeseries: TimeseriesPayload[];
};
