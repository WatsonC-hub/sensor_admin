import {Grid2} from '@mui/material';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import StamdataLocation from '../StamdataLocation';

type Props = {
  loc_id: number | undefined;
  size: number;
};

const DefaultLocationForm = ({size, loc_id}: Props) => {
  const {watch} = useFormContext();
  const disabled = loc_id !== undefined;

  const loctype_id = watch('loctype_id');

  if (loctype_id === -1 || loctype_id === 9) {
    return null;
  }

  return (
    <StamdataLocation>
      <Grid2 size={size}>
        <StamdataLocation.Locname disabled={disabled} />
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
    </StamdataLocation>
  );
};

export default DefaultLocationForm;
