import {FormHelperText, Grid} from '@mui/material';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import {FormContext} from './const';

import type {GridBaseProps, GridProps} from '@mui/material';
import type {ControllerProps, FieldValues, Path} from 'react-hook-form';

type FormControllerProps<T extends FieldValues, K extends Path<T>> = {
  name: K;
  gridSizes?: GridBaseProps['size'];
  gridProps?: GridProps;
  warning?: (value: boolean) => string | undefined;
} & Omit<ControllerProps<T, K>, 'name' | 'control'>;

const FormController = <T extends FieldValues, K extends Path<T>>({
  name,
  gridSizes,
  gridProps,
  warning,
  render,
  ...props
}: FormControllerProps<T, K>) => {
  const {control, watch} = useFormContext<T>();
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  const watchValue = watch(name);
  return (
    <Grid {...gridProps} size={gridSizes ?? contextGridSizes}>
      <Controller name={name} control={control} render={render} {...props} />
      {warning && <FormHelperText sx={{color: 'orange'}}>{warning(watchValue)}</FormHelperText>}
    </Grid>
  );
};

export default FormController;
