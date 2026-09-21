import React from 'react';
import {Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';
import {useAtomValue} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import useBreakpoints from '~/hooks/useBreakpoints';

const PejlingBoreholeForm = () => {
  const isPump = useAtomValue(boreholeIsPumpAtom);
  const {isMobile} = useBreakpoints();
  return (
    <Grid2
      container
      size={12}
      flexDirection={'column'}
      alignItems={'center'}
      maxWidth={'100%'}
      p={1}
    >
      <Grid2 container size={12} justifyContent={'center'}>
        <CompoundPejling.NotPossible />
        <CompoundPejling.IsPump />
      </Grid2>
      <CompoundPejling.Extrema />

      <Grid2 size={12}>
        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />
      </Grid2>

      <Grid2 size={12} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
        <CompoundPejling.TimeOfMeas label="Tidspunkt for pejling" />
      </Grid2>
      {isPump && (
        <Grid2
          size={12}
          width={'100%'}
          display={'flex'}
          flexDirection={'row'}
          flexWrap={isMobile ? 'wrap' : 'nowrap'}
          justifyContent={'center'}
        >
          <CompoundPejling.Service />
          <CompoundPejling.PumpStop />
        </Grid2>
      )}
      <CompoundPejling.Correction />
      <Grid2 size={12}>
        <CompoundPejling.Comment fullWidth />
      </Grid2>
    </Grid2>
  );
};

export default PejlingBoreholeForm;
