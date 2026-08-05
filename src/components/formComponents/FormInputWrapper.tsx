import {Grid} from '@mui/material';
import React from 'react';

import FormInput from '../FormInput';
import {FormContext} from './const';

import type {FormInputProps} from '../FormInput';
import type {GridBaseProps} from '@mui/material';
import type {FieldValues, Path} from 'react-hook-form';

type TextFieldProps<T extends FieldValues> = Omit<FormInputProps<T>, 'name'> & {
  name: Path<T>;
  gridSizes?: GridBaseProps['size'];
};

const FormInputWrapper = <T extends FieldValues>({
  name,
  gridSizes,
  ...props
}: TextFieldProps<T>) => {
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  return (
    <Grid size={gridSizes ?? contextGridSizes}>
      <FormInput<T> name={name} {...props} />
    </Grid>
  );
};

export default FormInputWrapper;
