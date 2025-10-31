import {Grid, Alert, Typography, Link} from '@mui/material';
import React from 'react';

import {limitDecimalNumbers} from '~/helpers/dateConverter';
import {stationPages} from '~/helpers/EnumHelper';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';

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
  const [, setShowForm] = useShowFormState();
  const [, setPageToShow] = useStationPages();
  const openAddMP = async () => {
    await setShowForm(null);
    setPageToShow(stationPages.MAALEPUNKT);
  };
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
      mx={'auto'}
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
          <Typography maxWidth={200}>
            Der er intet målepunkt registreret på det valgte tidspunkt.
          </Typography>
        ) : (
          <>
            <Typography>Målepunkt: {MPTitle}</Typography>
            <Typography>Kote: {koteTitle} m</Typography>
          </>
        )}
        <Link component="button" type="button" variant="body2" color="error" onClick={openAddMP}>
          Tilføj eller rediger målepunkt
        </Link>
      </Alert>
    </Grid>
  );
};

export default DisplayWaterlevelAlert;
