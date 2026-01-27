import {TimeseriesMeta} from '~/helpers/CreateStationContextProvider';
import {Watlevmp} from '../../schema';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import {AggregateController} from './AggregateController';
import {Dayjs} from 'dayjs';
import {AddUnitType} from '../forms/UnitForm';
import {AccessTable, ContactTable} from '~/types';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';

export type ControlSettings = {
  controls_per_year: number;
  lead_time: number;
  selectValue: 1 | 2;
};

export type LocationData = {
  loc_id?: number;
  loc_name?: string;
  loctype_id?: number;
  terrainqual?: string;
  terrainlevel?: number;
  boreholeno?: string;
  suffix?: string;
  x?: number;
  y?: number;
  initial_project_no?: string;
  description?: string;
  groups?: Array<any>;
};

export type LocationPayload = {
  meta: LocationData;
  contacts: ContactTable[];
  location_access: AccessTable[];
  ressourcer: Ressourcer[];
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

export type TransformedUnit = AddUnitType & {
  tstype_id: number;
};

export type RootPayload = {
  location?: LocationPayload;
  timeseries: TimeseriesPayload[];
};

export type SliceState<TData> = {
  required: boolean;
  valid: boolean;
  value?: TData;
  validate?: () => Promise<boolean>;
};

export type TimeseriesPayload = {
  meta: TimeseriesMeta;
  watlevmp?: Watlevmp;
  control_settings?: ControlSettings;
  sync?: SyncFormValues;
  unit?: AddUnitType;
};

export type SimpleContact = {
  name: string;
  email: string;
};

export type SimpleLocationAccess = {
  type: string;
  name: string;
};

export type TimeseriesController = AggregateController<TimeseriesPayload>;
export type LocationController = AggregateController<LocationPayload>;
