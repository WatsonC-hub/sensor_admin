import {GridBaseProps, Grid2, Grid2Props, FormHelperText} from '@mui/material';
import React from 'react';
import {FieldValues, useFormContext, Controller, Path, ControllerProps} from 'react-hook-form';
import {FormContext} from './const';

type FormControllerProps<T extends FieldValues, K extends Path<T>> = {
  name: K;
  gridSizes?: GridBaseProps['size'];
  gridProps?: Grid2Props;
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
    <Grid2 {...gridProps} size={gridSizes ?? contextGridSizes}>
      <Controller name={name} control={control} render={render} {...props} />
      {warning && <FormHelperText sx={{color: 'orange'}}>{warning(watchValue)}</FormHelperText>}
    </Grid2>
  );
};

export default FormController;
