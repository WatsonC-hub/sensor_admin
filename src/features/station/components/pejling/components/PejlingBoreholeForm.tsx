import React from 'react';
import {Box, Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';
import {useAtomValue} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import useBreakpoints from '~/hooks/useBreakpoints';

const PejlingBoreholeForm = () => {
  const isPump = useAtomValue(boreholeIsPumpAtom);
  const {isMobile} = useBreakpoints();
  return (
    <Box
    display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      maxWidth={350}
      p={1}
    >
      <Box display={'flex'} justifyContent={'center'}>
        <CompoundPejling.NotPossible />
        <CompoundPejling.IsPump />
      </Box>
      <CompoundPejling.Extrema />

        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />

      <CompoundPejling.TimeOfMeas label="Tidspunkt for pejling" />
      {isPump && (
        <Box
          flex={1}
          width={'100%'}
          display={'flex'}
          flexDirection={'row'}
          flexWrap={isMobile ? 'wrap' : 'nowrap'}
          justifyContent={'center'}
        >
          <CompoundPejling.Service />
          <CompoundPejling.PumpStop />
        </Box>
      )}
      <CompoundPejling.Correction />
      <CompoundPejling.Comment fullWidth />
    </Box>
  );
};

export default PejlingBoreholeForm;
