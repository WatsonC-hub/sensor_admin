import {Grid, Typography} from '@mui/material';
import React from 'react';

import {authStore} from '~/state/store';

import ContactInfo from './stationDetails/contacts/ContactInfo';
import LocationAccess from './stationDetails/locationAccessKeys/LocationAccess';
import Huskeliste from './stationDetails/ressourcer/Huskeliste';

type Props = {
  mode: string;
};

const StationDetails = ({mode}: Props) => {
  const superUser = authStore().superUser;

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} sm={12}>
        <Typography ml={2} py={0} variant="h6">
          Adgangsinformation
        </Typography>
        <LocationAccess />
      </Grid>
      <Grid item xs={12} sm={12}>
        <Typography ml={2} py={0} variant="h6">
          Kontaktinformation
        </Typography>
        <ContactInfo />
      </Grid>
      {superUser && mode === 'normal' && (
        <>
          <Typography ml={2} py={0} variant="h6">
            Huskeliste
          </Typography>
          <Grid item xs={12} sm={12}>
            <Huskeliste />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default StationDetails;
