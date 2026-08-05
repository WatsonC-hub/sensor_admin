import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {Grid} from '@mui/material';
import type {DefaultAddTimeseries} from '~/features/station/schema';
import type {FormInputProps} from '~/components/FormInput';

type Props = {
  size: number;
  loc_name: string | undefined;
  required?: boolean;
  slotProps?: {
    TypeSelect?: Omit<FormInputProps<DefaultAddTimeseries>, 'name'>;
    intakeno?: Omit<FormInputProps<DefaultAddTimeseries>, 'name'>;
  };
};

const DefaultTimeseriesForm = ({size, loc_name, required, slotProps}: Props) => {
  return (
    <>
      <Grid size={size}>
        <StamdataTimeseries.Prefix loc_name={loc_name} />
      </Grid>
      <Grid size={size}>
        <StamdataTimeseries.TypeSelect required={required} {...slotProps?.TypeSelect} />
      </Grid>
    </>
  );
};

export default DefaultTimeseriesForm;
