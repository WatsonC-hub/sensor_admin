import {Grid2} from '@mui/material';
import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {FormInputProps} from '~/components/FormInput';
import {BoreholeAddTimeseries} from '~/features/station/schema';

type Props = {
  size: number;
  slotProps?: {
    TypeSelect?: Omit<FormInputProps<BoreholeAddTimeseries>, 'name'>;
  };
};

const BoreholeTimeseriesForm = ({size, slotProps}: Props) => {
  return (
    <>
      <Grid2 size={size}>
        <StamdataTimeseries.Intakeno />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TypeSelect {...slotProps?.TypeSelect} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.SensorDepth />
      </Grid2>
    </>
  );
};

export default BoreholeTimeseriesForm;
