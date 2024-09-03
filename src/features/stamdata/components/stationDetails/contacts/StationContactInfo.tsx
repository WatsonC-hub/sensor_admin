import {MenuItem, Box, Collapse, Grid} from '@mui/material';
import React from 'react';

import FormInput from '~/components/FormInput';
import {ContactInfoRole} from '~/helpers/EnumHelper';

interface modalProps {
  modal: boolean;
  isUser: boolean;
}

export default function StationContactInfo({modal, isUser}: modalProps) {
  return (
    <Box>
      <Collapse in={true} sx={{width: 'inherit'}}>
        <Grid container spacing={1} my={1} alignItems="center">
          <Grid item xs={12} sm={6}>
            <FormInput
              name="contact_info.navn"
              label="Navn"
              required
              fullWidth
              disabled={!modal || isUser}
              sx={{
                mb: 2,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="contact_info.telefonnummer"
              defaultValue={null}
              label="Tlf. nummer"
              type={'number'}
              fullWidth
              disabled={!modal || isUser}
              sx={{
                mb: 2,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="contact_info.email"
              label="Email"
              type={'email'}
              required
              fullWidth
              disabled={!modal || isUser}
              sx={{
                mb: 2,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="contact_info.org"
              label="Organisation"
              fullWidth
              disabled={true}
              sx={{mb: 2}}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="contact_info.rolle"
              label="Rolle"
              select
              required
              fullWidth
              sx={{mb: 2}}
            >
              <MenuItem value={ContactInfoRole.DataEjer}>Data Ejer</MenuItem>
              <MenuItem value={ContactInfoRole.kontakter}>Kontakt</MenuItem>
            </FormInput>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="contact_info.kommentar"
              label="Kommentar"
              fullWidth
              // disabled={!modal}
              sx={{
                mb: 2,
              }}
            />
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
}
