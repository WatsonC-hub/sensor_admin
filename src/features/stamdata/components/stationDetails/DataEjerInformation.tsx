import {Box, Grid, Typography} from '@mui/material';
import React from 'react';

import FormInput from '~/components/FormInput';

const DataEjerInformation = () => {
  return (
    <Box
      component="fieldset"
      style={{borderLeft: 'none', borderRight: 'none', borderBottom: 'none'}}
    >
      <legend>
        <Typography variant="h6">Data ejer information</Typography>
      </legend>
      <Grid container spacing={1} my={1} justifyContent="center" alignItems="center">
        <Grid item xs={12} sm={6}>
          <FormInput
            name="stationDetails.dataEjerInformation.navn"
            label="Navn"
            required
            fullWidth
            disabled={true}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInput
            name="stationDetails.dataEjerInformation.organisation"
            label="Organisation"
            type="number"
            required
            fullWidth
            disabled={true}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInput
            name="stationDetails.dataEjerInformation.telefonnummer"
            label="Tlf. nummer"
            type="number"
            required
            fullWidth
            disabled={true}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormInput
            name="stationDetails.dataEjerInformation.email"
            label="Email"
            type={'email'}
            required
            fullWidth
            disabled={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataEjerInformation;
