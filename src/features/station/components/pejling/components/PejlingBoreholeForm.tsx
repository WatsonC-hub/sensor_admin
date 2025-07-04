import React from 'react';
import {Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';
import {useAtomValue} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';

const PejlingBoreholeForm = () => {
  const isPump = useAtomValue(boreholeIsPumpAtom);

  return (
    <Grid2
      container
      display={'flex'}
      size={12}
      flexDirection={'column'}
      alignItems={'center'}
      alignContent={'center'}
      justifyContent={'center'}
      spacing={2}
      maxWidth={600}
    >
      <Grid2
        container
        size={12}
        display={'flex'}
        flexDirection={'row'}
        alignContent={'center'}
        justifyContent={'center'}
      >
        <CompoundPejling.NotPossible />
        <CompoundPejling.IsPump />
      </Grid2>
      <CompoundPejling.Extrema />

      <Grid2 size={12}>
        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />
      </Grid2>
      <Grid2 container spacing={1} size={12} mb={2} display={'flex'} flexDirection={'column'}>
        <Grid2>
          <CompoundPejling.TimeOfMeas
            sx={{mb: 0, maxWidth: isPump ? 200 : undefined}}
            label="Tidspunkt for pejling"
          />
        </Grid2>
        <Grid2 display={'flex'} flexDirection={'row'}>
          {isPump && (
            <>
              <CompoundPejling.Service />
              <CompoundPejling.PumpStop />
            </>
          )}
        </Grid2>
      </Grid2>
      <CompoundPejling.Correction />
      <Grid2 size={12}>
        <CompoundPejling.Comment fullWidth />
      </Grid2>
    </Grid2>
  );
};

export default PejlingBoreholeForm;
