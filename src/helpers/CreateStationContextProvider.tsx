import React, {createContext, useMemo, useState} from 'react';
import {useLocation} from 'react-router';
import {useLocationData} from '~/hooks/query/useMetadata';
import {ContactTable} from '~/types';

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

export type FormState = {
  location?: LocationData;
  timeseries?: any;
  watlevmp?: any;
  unit?: any;
  sync?: any;
  contacts?: Array<ContactTable>;
};

type CreateStationContextType = {
  meta: MetaType | null;
  setMeta: React.Dispatch<React.SetStateAction<MetaType | null>>;
  formState?: FormState;
  //   setFormState?: React.Dispatch<React.SetStateAction<any>>;
  formErrors: Record<string, boolean>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  onValidate: (
    key: 'location' | 'timeseries' | 'watlevmp' | 'unit' | 'controlSettings' | 'sync' | 'contacts',
    data: any
  ) => void;
  activatedSections: Record<string, boolean>;
  setActivatedSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
};

const sections: Record<string, boolean> = {
  watlevmp: false,
  controlSettings: false,
  unitMeasurement: false,
  synchronization: false,
};

export const CreateStationContext = createContext<CreateStationContextType | null>(null);

const CreateStationContextProvider = ({children}: Props) => {
  let {state} = useLocation();
  state = state ?? {};

  const loc_id: number | undefined = state?.loc_id ?? undefined;

  const {data: metadata} = useLocationData(loc_id);

  const defaultLocationData = useMemo<LocationData>(() => {
    if (metadata === undefined)
      return {
        ...state,
        terrainqual: 'DTM',
      };

    return {
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
    };
  }, [metadata]);

  let defaultMeta = null;
  let defaultFormState = null;

  defaultMeta = {
    loc_id: metadata?.loc_id,
    loc_name: metadata?.loc_name,
    loctype_id: metadata?.loctype_id,
    ...(metadata?.boreholeno ? {boreholeno: metadata.boreholeno} : {}),
  };

  defaultFormState = {
    location: defaultLocationData,
  };

  const [meta, setMeta] = useState<MetaType | null>(defaultMeta);
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [activeStep, setActiveStep] = useState(loc_id ? 1 : 0);
  const [formErrors, setFormErrors] = useState<Record<string, any>>({});
  const [activatedSections, setActivatedSections] = useState<Record<string, boolean>>(sections);

  const onValidate = (
    key: 'location' | 'timeseries' | 'watlevmp' | 'unit' | 'controlSettings' | 'sync' | 'contacts',
    data: FormState[keyof FormState]
  ) => {
    if (data) {
      if (key === 'timeseries' && data.tstype_id !== 1) {
        setFormState((prev: FormState) => {
          delete prev['watlevmp'];
          return {...prev};
        });
      }

      if (
        key === 'timeseries' &&
        formState.unit !== undefined &&
        data.tstype_id !== formState.timeseries?.tstype_id
      ) {
        setFormState((prev: FormState) => {
          delete prev['unit'];
          return {...prev};
        });
      }

      setFormState((prev: FormState) => ({...prev, [key]: data}));
    }
  };

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
        activatedSections,
        setActivatedSections,
      }}
    >
      {children}
    </CreateStationContext.Provider>
  );
};

export default CreateStationContextProvider;
