import {Grid2} from '@mui/material';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import StamdataForm from './StamdataForm';

type Props = {
  size: number;
};

const DefaultInputs = ({size}: Props) => {
  const {watch} = useFormContext();

  const loctype_id = watch('loctype_id');

  if (loctype_id === -1 || loctype_id === 9) {
    return null;
  }

  return (
    <>
      <Grid2 size={size}>
        <StamdataForm.LocnameInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataForm.InitialProjectNoInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataForm.GroupsInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataForm.XInput />
      </Grid2>
      <Grid2 size={size}>
        <StamdataForm.YInput />
      </Grid2>
      <Grid2 display={'flex'} flexDirection={'row'} size={size} gap={2}>
        <Grid2 size={9}>
          <StamdataForm.TerrainQuoteInput />
        </Grid2>
        <Grid2 size={3}>
          <StamdataForm.TerrainQualityInput />
        </Grid2>
      </Grid2>
    </>
  );
};

export default DefaultInputs;
