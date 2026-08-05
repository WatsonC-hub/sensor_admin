import type {GridBaseProps} from '@mui/material';
import {Grid} from '@mui/material';
import React from 'react';
import type {FieldValues, Path} from 'react-hook-form';
import type {FormInputProps} from '../FormInput';
import FormInput from '../FormInput';
import {FormContext} from './const';

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
