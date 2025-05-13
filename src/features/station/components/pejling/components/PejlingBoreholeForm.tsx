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

      <Grid2 size={12} maxWidth={400}>
        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />
      </Grid2>
      <Grid2 container spacing={1} size={12} mb={2} display={'flex'} flexDirection={'row'}>
        <CompoundPejling.TimeOfMeas
          sx={{mb: 0, maxWidth: isPump ? 200 : undefined}}
          label="Tidspunkt for pejling"
        />
        {isPump && (
          <>
            <CompoundPejling.Service />
            <CompoundPejling.PumpStop sx={{maxWidth: 200}} />
          </>
        )}
      </Grid2>
      <CompoundPejling.Correction />
      <CompoundPejling.Comment />
    </Grid2>
  );
};

export default PejlingBoreholeForm;
