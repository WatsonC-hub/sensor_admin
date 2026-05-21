import {Grid2} from '@mui/material';
import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {FormInputProps} from '~/components/FormInput';
import {BoreholeAddTimeseries} from '~/features/station/schema';

type Props = {
  size: number;
  required?: boolean;
  slotProps?: {
    TypeSelect?: Omit<FormInputProps<BoreholeAddTimeseries>, 'name'>;
    intakeno?: Omit<FormInputProps<BoreholeAddTimeseries>, 'name'>;
  };
};

const BoreholeTimeseriesForm = ({size, required, slotProps}: Props) => {
  return (
    <>
      <Grid2 size={size}>
        <StamdataTimeseries.Intakeno {...slotProps?.intakeno} />
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

export default BoreholeTimeseriesForm;
