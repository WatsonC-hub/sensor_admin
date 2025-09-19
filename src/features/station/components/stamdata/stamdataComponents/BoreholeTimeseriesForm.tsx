import {Grid2} from '@mui/material';
import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';

type Props = {
  size: number;
};

const BoreholeTimeseriesForm = ({size}: Props) => {
  return (
    <>
      <Grid2 size={size}>
        <StamdataTimeseries.Intakeno />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TypeSelect />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.SensorDepth />
      </Grid2>
      <Grid2 size={size} alignContent="center">
        <StamdataTimeseries.requiredService />
      </Grid2>
    </>
  );
};

export default BoreholeTimeseriesForm;
