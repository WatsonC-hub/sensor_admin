import {Dayjs} from 'dayjs';
import React, {createContext, useEffect, useState} from 'react';
import {useLocation} from 'react-router';
import {Ressourcer} from '~/features/stamdata/components/stationDetails/ressourcer/multiselect/types';
import {Watlevmp} from '~/features/station/schema';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import {useLocationData} from '~/hooks/query/useMetadata';
import {AccessTable, ContactTable} from '~/types';

type Props = {
  children?: React.ReactNode;
};

type MetaType = {
  tstype_id?: Array<number>;
  loctype_id?: number;
  loc_id?: number;
  loc_name?: string;
  boreholeno?: string;
  intakeno?: number;
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

export type UnitData = {
  unit_uuid: string;
  startdate: Dayjs;
  calypso_id: number;
  sensor_id: string;
  sensortypeid: number;
};

type TimeseriesData = {
  tstype_id: number | null | undefined;
  prefix?: string | null | undefined;
  sensor_depth_m?: number | null | undefined;
  calypso_id?: number | undefined;
  intakeno?: number | null | undefined;
  sensor_id?: string;
  unit_uuid?: string;
};

export type FormState = {
  location?: LocationData;
  timeseries?: Array<TimeseriesData>;
  watlevmp?: Array<Watlevmp>;
  units?: Array<UnitData>;
  sync?: SyncFormValues;
  contacts?: Array<ContactTable>;
  location_access?: Array<AccessTable>;
  ressources?: Array<Ressourcer>;
};

type CreateStationContextType = {
  meta: MetaType | null;
  setMeta: React.Dispatch<React.SetStateAction<MetaType | null>>;
  formState: FormState;
  formErrors: Record<string, boolean>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  onValidate: (
    key:
      | 'location'
      | 'timeseries'
      | 'watlevmp'
      | 'units'
      | 'control_settings'
      | 'sync'
      | 'contacts'
      | 'location_access'
      | 'ressources',
    data: any
  ) => void;
};

export const CreateStationContext = createContext<CreateStationContextType | null>(null);

const CreateStationContextProvider = ({children}: Props) => {
  let {state} = useLocation();
  state = state ?? {};

  const loc_id: number | undefined = state?.loc_id ?? undefined;
  const {data: metadata} = useLocationData(loc_id);

  const defaultData = {
    location: loc_id === undefined ? {...state, terrainqual: 'DTM'} : {},
  };

  const [meta, setMeta] = useState<MetaType | null>({loc_id: loc_id});
  const [formState, setFormState] = useState<FormState>(loc_id === undefined ? defaultData : {});
  const [activeStep, setActiveStep] = useState(loc_id ? 1 : 0);
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});

  const onValidate = (
    key:
      | 'location'
      | 'timeseries'
      | 'watlevmp'
      | 'units'
      | 'control_settings'
      | 'sync'
      | 'contacts'
      | 'location_access'
      | 'ressources',
    data: FormState[keyof FormState]
  ) => {
    if (data) {
      setFormState((prev: FormState) => ({...prev, [key]: data}));
    }
  };

  useEffect(() => {
    if (metadata === undefined) return;
    else {
      setMeta((prev) => ({
        ...prev,
        loc_name: metadata.loc_name,
        loctype_id: metadata.loctype_id,
        ...(metadata.boreholeno ? {boreholeno: metadata.boreholeno} : {}),
      }));
    }
  }, [metadata !== undefined]);

  return (
    <CreateStationContext.Provider
      value={{
        meta,
        setMeta,
        formState,
        activeStep,
        setActiveStep,
        formErrors,
        setFormErrors,
        onValidate,
      }}
    >
      {children}
    </CreateStationContext.Provider>
  );
};

export default CreateStationContextProvider;
