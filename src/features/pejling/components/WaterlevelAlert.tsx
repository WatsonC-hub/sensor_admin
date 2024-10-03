import {Grid, Alert, Typography} from '@mui/material';
import React from 'react';

import {limitDecimalNumbers} from '~/helpers/dateConverter';

type Props = {
  latestMeasurementSeverity: 'warning' | 'info';
  MPTitle: string;
  koteTitle: string | number;
  elevationDiff: number | undefined;
  pejlingOutOfRange: boolean;
};

const WaterlevelAlert = ({
  elevationDiff,
  pejlingOutOfRange,
  latestMeasurementSeverity,
  MPTitle,
  koteTitle,
}: Props) => {
  return (
    <Grid
      item
      xs={12}
      sm={7}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Alert
        severity={latestMeasurementSeverity}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {elevationDiff ? (
          <Typography>
            Forskel til seneste måling: {limitDecimalNumbers(elevationDiff)} m
          </Typography>
        ) : (
          <Typography>Forskel kan ikke beregnes uden en seneste værdi</Typography>
        )}
      </Alert>
      <Alert
        severity={pejlingOutOfRange ? 'error' : 'info'}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {pejlingOutOfRange ? (
          <Typography>Der er intet målepunkt registreret på det valgte tidspunkt.</Typography>
        ) : (
          <>
            <Typography>Målepunkt: {MPTitle}</Typography>
            <Typography>Kote: {koteTitle} m</Typography>
          </>
        )}
      </Alert>
    </Grid>
  );
};

export default WaterlevelAlert;
