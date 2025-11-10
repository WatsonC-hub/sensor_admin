import {GridBaseProps, Grid2} from '@mui/material';
import React from 'react';
import {FieldValues, Path} from 'react-hook-form';
import FormInput, {FormInputProps} from '../FormInput';
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
    <Grid2 size={gridSizes ?? contextGridSizes}>
      <FormInput<T> name={name} {...props} />
    </Grid2>
  );
};

export default FormInputWrapper;
