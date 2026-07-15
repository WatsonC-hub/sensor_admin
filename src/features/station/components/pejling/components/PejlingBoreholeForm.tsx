import React from 'react';
import {Grid} from '@mui/material';
import CompoundPejling from '../CompoundPejling';
import {useAtomValue} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import useBreakpoints from '~/hooks/useBreakpoints';

const PejlingBoreholeForm = () => {
  const isPump = useAtomValue(boreholeIsPumpAtom);
  const {isMobile} = useBreakpoints();
  return (
    <Grid
      container
      size={12}
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '100%',
        p: 1,
      }}
    >
      <Grid
        container
        size={12}
        sx={{
          justifyContent: 'center',
        }}
      >
        <CompoundPejling.NotPossible />
        <CompoundPejling.IsPump />
      </Grid>
      <CompoundPejling.Extrema />
      <Grid size={12}>
        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />
      </Grid>
      <Grid
        size={12}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <CompoundPejling.TimeOfMeas label="Tidspunkt for pejling" />
      </Grid>
      {isPump && (
        <Grid
          size={12}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            justifyContent: 'center',
          }}
        >
          <CompoundPejling.Service />
          <CompoundPejling.PumpStop />
        </Grid>
      )}
      <CompoundPejling.Correction />
      <Grid size={12}>
        <CompoundPejling.Comment fullWidth />
      </Grid>
    </Grid>
  );
};

export default PejlingBoreholeForm;
