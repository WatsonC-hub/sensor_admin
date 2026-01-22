import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {Grid2} from '@mui/material';
import {DefaultAddTimeseries} from '~/features/station/schema';
import {FormInputProps} from '~/components/FormInput';

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
      <Grid2 size={size}>
        <StamdataTimeseries.Prefix loc_name={loc_name} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TypeSelect required={required} {...slotProps?.TypeSelect} />
      </Grid2>
      {/* <Grid2 size={size}>
        <StamdataTimeseries.SensorDepth />
      </Grid2> */}
    </>
  );
};

export default DefaultTimeseriesForm;
