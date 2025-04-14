import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {Grid2} from '@mui/material';

type Props = {
  size: number;
  loctype_id: number | undefined;
};

const BoreholeLocationForm = ({size, loctype_id}: Props) => {
  if (loctype_id !== 9) {
    return null;
  }

  return (
    <>
      <Grid2 size={size}>
        <StamdataLocation.Boreholeno />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.BoreholeSuffix />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.X />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Y />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.TerrainQuote />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.TerrainQuality />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Description />
      </Grid2>
    </>
  );
};

export default BoreholeLocationForm;
