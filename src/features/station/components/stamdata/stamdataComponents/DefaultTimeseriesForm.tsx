import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {Grid2} from '@mui/material';

type Props = {
  size: number;
  loctype_id: number;
};

const DefaultTimeseriesForm = ({size, loctype_id}: Props) => {
  if (loctype_id === 9) {
    return null;
  }

  return (
    <>
      <Grid2 size={size}>
        <StamdataTimeseries.Prefix />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TypeSelect />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.SensorDepth />
      </Grid2>
    </>
  );
};

export default DefaultTimeseriesForm;
