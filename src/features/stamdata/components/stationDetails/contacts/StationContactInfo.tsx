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
              placeholder="Navn på kontakten..."
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
              placeholder="Telefonnummer..."
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
              placeholder="Email på kontakten..."
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
              placeholder="Organisationen kontakten er tilknyttet..."
              fullWidth
              disabled={true}
              sx={{mb: 2}}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormInput
              name="contact_info.rolle"
              label="Rolle"
              placeholder="Hvilken rolle har kontakten..."
              select
              required
              fullWidth
              sx={{mb: 2}}
            >
              <MenuItem value={'-1'} key={'-1'}>
                Vælg type
              </MenuItem>
              <MenuItem value={ContactInfoRole.DataEjer}>Data Ejer</MenuItem>
              <MenuItem value={ContactInfoRole.kontakter}>Kontakt</MenuItem>
            </FormInput>
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormInput
              name="contact_info.kommentar"
              label="Kommentar"
              multiline
              placeholder="Eks. kan kun kontaktes mellem 9-10 på telefonnummer..."
              fullWidth
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
