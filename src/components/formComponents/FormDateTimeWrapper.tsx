import {Grid} from '@mui/material';
import React from 'react';

import FormDateTime from '../FormDateTime';
import {FormContext} from './const';

import type {FormDateTimeProps} from '../FormDateTime';
import type {GridBaseProps} from '@mui/material';
import type {FieldValues, Path} from 'react-hook-form';

export type DatetimeProps<T extends FieldValues> = Omit<FormDateTimeProps<T>, 'name'> & {
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
    <Grid size={gridSizes ?? contextGridSizes}>
      <FormDateTime<T> name={name} {...props} />
    </Grid>
  );
};

export default FormDateTimeWrapper;
