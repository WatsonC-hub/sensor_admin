import {Grid, Alert, Typography} from '@mui/material';
import React from 'react';

import {limitDecimalNumbers} from '~/helpers/dateConverter';

type Props = {
  latestMeasurementSeverity: 'warning' | 'info';
  hide: boolean;
  MPTitle: string;
  koteTitle: string | number;
  elevationDiff: number | undefined;
  pejlingOutOfRange: boolean;
};

const DisplayWaterlevelAlert = ({
  elevationDiff,
  pejlingOutOfRange,
  latestMeasurementSeverity,
  MPTitle,
  koteTitle,
  hide,
}: Props) => {
  return (
    <Grid
      size={{xs: 12, sm: 7}}
      sx={{
        mx: 'auto',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {elevationDiff !== undefined && (
        <Alert
          severity={latestMeasurementSeverity}
          sx={{
            display: hide ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography>
            Forskel til seneste måling: {limitDecimalNumbers(elevationDiff)} m
          </Typography>
        </Alert>
      )}
      <Alert
        severity={pejlingOutOfRange ? 'error' : 'info'}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {pejlingOutOfRange ? (
          <Typography
            sx={{
              maxWidth: 200,
            }}
          >
            Der er intet målepunkt registreret på det valgte tidspunkt.
          </Typography>
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

export default DisplayWaterlevelAlert;
