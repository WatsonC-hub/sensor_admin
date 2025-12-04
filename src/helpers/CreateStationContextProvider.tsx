import {Dayjs} from 'dayjs';
import React, {createContext, useEffect, useState} from 'react';
import {useLocation} from 'react-router';
import {Watlevmp} from '~/features/station/schema';
import {SyncFormValues} from '~/features/synchronization/api/useSyncForm';
import {useLocationData} from '~/hooks/query/useMetadata';
import {AccessTable, ContactTable} from '~/types';

type Props = {
  children?: React.ReactNode;
};

type MetaType = {
  tstype_id?: number;
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

type UnitData = {
  unit_uuid: string;
  startdate: Dayjs;
};

type TimeseriesData = {
  tstype_id: number;
  prefix?: string | null | undefined;
  sensor_depth_m?: number | null | undefined;
  calypso_id?: number | undefined;
};

export type FormState = {
  location?: LocationData;
  timeseries?: TimeseriesData;
  watlevmp?: Watlevmp;
  unit?: UnitData;
  sync?: SyncFormValues;
  contacts?: Array<ContactTable>;
  location_access?: Array<AccessTable>;
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
      | 'unit'
      | 'control_settings'
      | 'sync'
      | 'contacts'
      | 'location_access',
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
  const [formState, setFormState] = useState<FormState>(defaultData);
  const [activeStep, setActiveStep] = useState(loc_id ? 1 : 0);
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});

  const onValidate = (
    key:
      | 'location'
      | 'timeseries'
      | 'watlevmp'
      | 'unit'
      | 'control_settings'
      | 'sync'
      | 'contacts'
      | 'location_access',
    data: FormState[keyof FormState]
  ) => {
    if (data) {
      if (key === 'timeseries' && (data as TimeseriesData).tstype_id !== 1) {
        setFormState((prev: FormState) => {
          delete prev['watlevmp'];
          return {...prev};
        });
      }

      if (
        key === 'timeseries' &&
        formState.unit !== undefined &&
        (data as TimeseriesData).tstype_id !== formState.timeseries?.tstype_id
      ) {
        setFormState((prev: FormState) => {
          delete prev['unit'];
          return {...prev};
        });
      }

      setFormState((prev: FormState) => ({...prev, [key]: data}));
    }
  };

  useEffect(() => {
    if (metadata === undefined) return;
    else {
      setFormState((prev) => ({
        ...prev,
        location: {
          loc_id: metadata.loc_id,
          loc_name: metadata.loc_name,
          loctype_id: metadata.loctype_id,
          terrainqual: metadata.terrainqual,
          terrainlevel: metadata.terrainlevel,
          boreholeno: metadata.boreholeno,
          suffix: metadata.suffix,
          x: metadata.x,
          y: metadata.y,
          initial_project_no: metadata.projectno,
          description: metadata.description,
          groups: metadata.groups,
        },
      }));

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
