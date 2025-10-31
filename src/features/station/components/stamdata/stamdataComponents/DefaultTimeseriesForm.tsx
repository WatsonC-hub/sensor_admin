import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {Grid2} from '@mui/material';

type Props = {
  size: number;
  loc_name: string | undefined;
};

const DefaultTimeseriesForm = ({size, loc_name}: Props) => {
  return (
    <>
      <Grid2 size={size}>
        <StamdataTimeseries.Prefix loc_name={loc_name} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TypeSelect />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.SensorDepth />
      </Grid2>
      <Grid2 size={size} alignContent={'center'}>
        <StamdataTimeseries.Hidden />
      </Grid2>
    </>
  );
};

export default DefaultTimeseriesForm;
