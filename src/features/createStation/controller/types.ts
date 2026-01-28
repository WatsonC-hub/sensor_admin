import {TimeseriesMeta} from '~/helpers/CreateStationContextProvider';
import {Watlevmp} from '~/features/station/schema';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import {AggregateController} from './AggregateController';
import {Dayjs} from 'dayjs';
import {AddUnitType} from '../forms/UnitForm';
import {AccessTable, ContactTable, Group} from '~/types';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';

export type ControlSettingsFormState = {
  controls_per_year: number;
  lead_time: number;
  selectValue: 1 | 2;
};

/*  FORMSTATE */
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

export type AddTimeseriesLocationData = {
  loc_id: number;
  loctype_id: number;
};

export type LocationFormState = {
  meta: CreateLocationData | AddTimeseriesLocationData;
  contacts?: ContactTable[];
  location_access?: AccessTable[];
  ressourcer?: Ressourcer[];
};

export type UnitValues = {
  unit_uuid: string;
  startdate: string;
};

export type UnitData = {
  unit_uuid: string;
  startdate: Dayjs;
  calypso_id: string;
  sensor_id: string;
  sensortypeid: number;
};

export type TimeseriesPayload = {
  meta: TimeseriesMeta;
  watlevmp?: Watlevmp;
  control_settings?: ControlSettingsFormState;
  sync?: SyncFormValues;
  unit?: AddUnitType;
};

export type CreateStationPayload = {
  location: LocationFormState;
  timeseries: TimeseriesPayload[];
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

export type SliceState<TData> = {
  required: boolean;
  valid: boolean;
  value?: TData;
  validate?: () => Promise<boolean>;
};
export type TimeseriesController = AggregateController<TimeseriesPayload>;
export type LocationController = AggregateController<LocationFormState>;
