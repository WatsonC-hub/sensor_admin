import {Box} from '@mui/material';
import {useAtomValue} from 'jotai';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import {boreholeIsPumpAtom} from '~/state/atoms';

import CompoundPejling from '../CompoundPejling';

const PejlingBoreholeForm = () => {
  const isPump = useAtomValue(boreholeIsPumpAtom);
  const {isMobile} = useBreakpoints();
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 350, p: 1}}>
      <Box sx={{display: 'flex', justifyContent: 'center'}}>
        <CompoundPejling.NotPossible />
        <CompoundPejling.IsPump />
      </Box>
      <CompoundPejling.Extrema />

      <CompoundPejling.Measurement />
      <CompoundPejling.WaterlevelAlert />

      <CompoundPejling.TimeOfMeas label="Tidspunkt for pejling" />
      {isPump && (
        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: 'center',
          }}
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
