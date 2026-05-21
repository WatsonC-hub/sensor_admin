import {InputAdornment} from '@mui/material';
import React from 'react';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {Watlevmp} from '../../schema';

type MPFormCompoundProps = {
  children: React.ReactNode;
};

const MPFormCompound = ({children}: MPFormCompoundProps) => {
  return <>{children}</>;
};

const Elevation = (props: Omit<FormInputProps<Watlevmp>, 'name'>) => {
  return (
    <FormInput
      type="number"
      label="Målepunktskote"
      name="elevation"
      required
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
  return (
    <FormInput
      label="Målepunkt placering"
      name="description"
      required
      disabled={props.disabled}
      fullWidth
      placeholder="f.eks. top af rør"
      {...props}
    />
  );
};

MPFormCompound.Elevation = Elevation;
MPFormCompound.Description = Description;

export default MPFormCompound;
