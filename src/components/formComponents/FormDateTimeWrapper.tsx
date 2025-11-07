import {GridBaseProps, Grid2} from '@mui/material';
import React from 'react';
import {FieldValues, Path} from 'react-hook-form';
import {FormContext} from './const';
import FormDateTime, {FormDateTimeProps} from '../FormDateTime';

type DatetimeProps<T extends FieldValues> = Omit<FormDateTimeProps<T>, 'name'> & {
  name: Path<T>;
  gridSizes?: GridBaseProps['size'];
};

const FormDateTimeWrapper = <T extends FieldValues>({
  name,
  gridSizes,
  ...props
}: DatetimeProps<T>) => {
  const {gridSizes: contextGridSizes} = React.useContext(FormContext);
  return (
    <Grid2 size={gridSizes ?? contextGridSizes}>
      <FormDateTime<T> name={name} {...props} />
    </Grid2>
  );
};

export default FormDateTimeWrapper;
