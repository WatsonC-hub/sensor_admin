import {Grid2} from '@mui/material';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import StamdataLocation from '../StamdataLocation';

type Props = {
  size: number;
};

const DefaultInputs = ({size}: Props) => {
  const {watch} = useFormContext();

  const loctype_id = watch('location.loctype_id');

  if (loctype_id === -1 || loctype_id === 9) {
    return null;
  }

  return (
    <>
      <Grid2 size={size}>
        <StamdataLocation.LocnameInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.InitialProjectNoInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.GroupsInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.XInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.YInput />
      </Grid2>
      <Grid2 display={'flex'} flexDirection={'row'} size={size} gap={2}>
        <Grid2 size={9}>
          <StamdataLocation.TerrainQuoteInput />
        </Grid2>
        <Grid2 size={3}>
          <StamdataLocation.TerrainQualityInput />
        </Grid2>
      </Grid2>
    </>
  );
};

export default DefaultInputs;
