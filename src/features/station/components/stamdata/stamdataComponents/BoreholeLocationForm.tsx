import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {Grid2} from '@mui/material';

type Props = {
  size: number;
  loctype_id: number | undefined;
  loc_id: string | undefined;
};

const BoreholeLocationForm = ({size, loctype_id, loc_id}: Props) => {
  if (loctype_id !== 9) {
    return null;
  }

  const disabled = loc_id !== undefined;

  return (
    <>
      <Grid2 size={size}>
        <StamdataLocation.Boreholeno disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.BoreholeSuffix disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.InitialProjectNo disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Groups disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.X disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Y disabled={disabled} />
      </Grid2>
      <Grid2 display={'flex'} flexDirection={'row'} size={size} gap={2}>
        <Grid2 size={9}>
          <StamdataLocation.TerrainQuote disabled={disabled} />
        </Grid2>
        <Grid2 size={3}>
          <StamdataLocation.TerrainQuality disabled={disabled} />
        </Grid2>
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Description disabled={disabled} />
      </Grid2>
    </>
  );
};

export default BoreholeLocationForm;
