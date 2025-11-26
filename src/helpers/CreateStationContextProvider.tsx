import React, {createContext} from 'react';
import {useLocation} from 'react-router';
import {useLocationData} from '~/hooks/query/useMetadata';

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

type CreateStationContextType = {
  meta: MetaType | null;
  setMeta: React.Dispatch<React.SetStateAction<MetaType | null>>;
  formState?: any;
  //   setFormState?: React.Dispatch<React.SetStateAction<any>>;
  formErrors: Record<string, boolean>;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  onValidate: (key: 'location' | 'timeseries' | 'watlevmp' | 'unit', data: any) => void;
};

export const CreateStationContext = createContext<CreateStationContextType | null>(null);

const CreateStationContextProvider = ({children}: Props) => {
  let {state} = useLocation();
  state = state ?? {};

  const loc_id: number | undefined = state?.loc_id ?? undefined;

  const {data: metadata} = useLocationData(loc_id);

  const data = {
    ...state,
    terrainqual: 'DTM',
    ...metadata,
  };

  const defaultValues = {
    ...data,
    loctype_id: 'loctype_id' in state ? state.loctype_id : undefined,
    initial_project_no: metadata?.projectno,
  };

  let defaultMeta = null;
  let defaultFormState = null;

  defaultMeta = {
    loc_id: metadata?.loc_id,
    loc_name: metadata?.loc_name,
    loctype_id: metadata?.loctype_id,
    ...(metadata?.boreholeno ? {boreholeno: metadata.boreholeno} : {}),
  };

  defaultFormState = {
    location: defaultValues,
  };

  const [meta, setMeta] = React.useState<MetaType | null>(defaultMeta);
  const [formState, setFormState] = React.useState(defaultFormState);
  const [activeStep, setActiveStep] = React.useState(0);
  const [formErrors, setFormErrors] = React.useState<Record<string, any>>({});

  const onValidate = (key: 'location' | 'timeseries' | 'watlevmp' | 'unit', data: any) => {
    if (data) {
      setFormState((prev: any) => ({...prev, [key]: data}));
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
      }}
    >
      {children}
    </CreateStationContext.Provider>
  );
};

export default CreateStationContextProvider;
