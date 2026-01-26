import {TimeseriesMeta} from '~/helpers/CreateStationContextProvider';
import {Watlevmp} from '../../schema';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import {AggregateController} from './AggregateController';
import {Dayjs} from 'dayjs';
import {AddUnitType} from '../forms/UnitForm';

export type ControlSettings = {
  controls_per_year: number;
  lead_time: number;
  selectValue: 1 | 2;
};

type LocationData = {
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

// export type UnitDisplayValues = {
//   unit_uuid: string;
//   startdate: Date;
//   calypso_id: number;
//   sensor_id: string;
// };

export type RootPayload = {
  location?: LocationData;
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

export type TimeseriesController = AggregateController<TimeseriesPayload>;
