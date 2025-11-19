import React from 'react';
import StamdataWatlevmp from '../StamdataWatlevmp';
import {Grid2} from '@mui/material';

type DefaultWatlevmpFormProps = {
  helperText?: string;
};

const DefaultWatlevmpForm = ({helperText}: DefaultWatlevmpFormProps) => {
  return (
    <>
      <Grid2 size={4}>
        <StamdataWatlevmp.Elevation helperText={helperText} />
      </Grid2>
      <Grid2 size={8}>
        <StamdataWatlevmp.Description />
      </Grid2>
    </>
  );
};

export default DefaultWatlevmpForm;
