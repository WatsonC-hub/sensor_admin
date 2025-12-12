import {InputAdornment} from '@mui/material';
import React from 'react';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {Watlevmp} from '../../schema';

type StamdataWatlevmpProps = {
  children: React.ReactNode;
  tstype_id: number | undefined;
};

type WatlevmpContextType = {
  tstype_id: number | undefined;
};

const WatlevmpContext = React.createContext<WatlevmpContextType>({
  tstype_id: undefined,
});

const StamdataWatlevmp = ({children, tstype_id}: StamdataWatlevmpProps) => {
  return <WatlevmpContext.Provider value={{tstype_id}}>{children}</WatlevmpContext.Provider>;
};

const Elevation = (props: Omit<FormInputProps<Watlevmp>, 'name'>) => {
  const {tstype_id} = React.useContext(WatlevmpContext);

  if (tstype_id !== 1) {
    return null;
  }

  return (
    <FormInput
      type="number"
      label="Målepunktskote"
      name="elevation"
      disabled={props.disabled}
      fullWidth
      InputProps={{
        endAdornment: <InputAdornment position="start">m</InputAdornment>,
      }}
      {...props}
    />
  );
};

const Description = (props: Omit<FormInputProps<Watlevmp>, 'name'>) => {
  const {tstype_id} = React.useContext(WatlevmpContext);

  if (tstype_id !== 1) {
    return null;
  }

  return (
    <FormInput
      label="Målepunkt placering"
      name="description"
      disabled={props.disabled}
      fullWidth
      placeholder="f.eks. top af rør"
      {...props}
    />
  );
};

StamdataWatlevmp.Elevation = Elevation;
StamdataWatlevmp.Description = Description;

export default StamdataWatlevmp;
