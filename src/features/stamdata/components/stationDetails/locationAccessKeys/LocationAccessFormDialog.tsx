import {Autocomplete, Box, Collapse, Grid, MenuItem, TextField, Typography} from '@mui/material';
import React from 'react';
import {Controller, get, useFormContext} from 'react-hook-form';

import FormInput from '~/components/FormInput';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import {AccessType} from '~/helpers/EnumHelper';

type Props = {
  loc_id: number | undefined;
  editMode?: boolean;
};

const LocationAccessFormDialog = ({loc_id, editMode = false}: Props) => {
  const {
    control,
    watch,
    formState: {errors},
  } = useFormContext();

  const {
    get_all: {data: contacts},
  } = useContactInfo(loc_id);

  const navnLabel = watch('adgangsforhold.type');
  const location_access_id = watch('adgangsforhold.id');

  return (
    <Box>
      {contacts && (
        <Collapse in={true} sx={{width: 'inherit'}}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <FormInput
                name="adgangsforhold.type"
                label="Type"
                placeholder="Vælg en type..."
                select
                required
                fullWidth
                disabled={location_access_id && location_access_id !== -1}
                style={{
                  marginTop: 12,
                }}
              >
                <MenuItem value={'-1'} key={'-1'}>
                  Vælg type
                </MenuItem>
                <MenuItem value={AccessType.Code}>Kode</MenuItem>
                <MenuItem value={AccessType.Key}>Nøgle</MenuItem>
              </FormInput>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="adgangsforhold.contact_id"
                control={control}
                rules={{
                  required: true,
                }}
                render={({field: {onChange, value}}) => (
                  <Autocomplete
                    options={contacts ?? []}
                    fullWidth
                    disabled={location_access_id && location_access_id !== -1 && !editMode}
                    getOptionLabel={(option) => {
                      const contact = contacts.find((contact) =>
                        typeof option === 'string'
                          ? contact.id === option
                          : contact.id === option.id
                      );
                      let navn = '';
                      if (contact) navn = contact.navn;
                      return navn;
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (typeof value === 'string') return option && value && option.id === value;

                      return option && value && option.id === value.id;
                    }}
                    value={value ?? null}
                    onChange={(event, value) => {
                      if (value) onChange(value.id);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        fullWidth
                        InputLabelProps={{shrink: true}}
                        value={value && contacts.find((contact) => contact.id === value.id)?.navn}
                        error={
                          !!get(errors, 'adgangsforhold.contact_id') &&
                          get(errors, 'adgangsforhold.contact_id').message
                        }
                        helperText={
                          get(errors, 'adgangsforhold.contact_id') &&
                          'En kontakt skal vælges ud fra listen'
                        }
                        variant="outlined"
                        label="Kontakt"
                        placeholder="Vælg Kontakt"
                        sx={{
                          pb: get(errors, 'adgangsforhold.contact_id') ? 0 : 2,
                          '& .MuiInputBase-input.Mui-disabled': {
                            WebkitTextFillColor: '#000000',
                          },
                          '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                          '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
                          '& .MuiOutlinedInput-root': {
                            '& > fieldset': {borderColor: 'primary.main'},
                          },
                        }}
                        style={{
                          marginTop: 12,
                        }}
                      />
                    )}
                    renderOption={(props, option) => {
                      return (
                        <li {...props} key={option.id}>
                          <Box display={'flex'} flexDirection={'column'}>
                            <Typography>{option.navn}</Typography>
                            <Box display={'flex'} flexDirection={'row'} mx={2} gap={1}>
                              <Typography variant="body2">{option.email}</Typography>
                            </Box>
                          </Box>
                        </li>
                      );
                    }}
                    filterSelectedOptions
                    filterOptions={(options, params) => {
                      // const filtered = filter(options, params);
                      const {inputValue} = params;

                      const filter = options.filter(
                        (option) =>
                          option.navn.includes(inputValue) || option.email.includes(inputValue)
                      );

                      return filter;
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {navnLabel && navnLabel !== '-1' && (
                <FormInput
                  name="adgangsforhold.navn"
                  label={navnLabel === AccessType.Code ? 'Navn' : 'Nøgle ID.'}
                  placeholder={
                    navnLabel === AccessType.Code
                      ? 'Eks. identificerbart navn...'
                      : 'Eks. et identificerbart tal...'
                  }
                  required
                  fullWidth
                  style={{marginBottom: 12}}
                  disabled={location_access_id && location_access_id !== -1 && !editMode}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              {navnLabel && navnLabel !== '-1' && (
                <>
                  {navnLabel === AccessType.Code ? (
                    <FormInput
                      name="adgangsforhold.koden"
                      label={'Koden på låsen'}
                      placeholder="Eks. kode 2024 eller 3962..."
                      required
                      disabled={location_access_id && location_access_id !== -1 && !editMode}
                      fullWidth
                    />
                  ) : (
                    <FormInput
                      name="adgangsforhold.placering"
                      label={'Udleveres på adresse'}
                      placeholder="Eks. Østre Alle, 9000 Aalborg..."
                      required
                      disabled={location_access_id && location_access_id !== -1 && !editMode}
                      fullWidth
                    />
                  )}
                </>
              )}
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormInput
                name="adgangsforhold.kommentar"
                label={'Kommentar'}
                multiline
                placeholder="F.eks. at det er tredje hænge lås eller det er koden til en dør..."
                disabled={location_access_id && location_access_id !== -1 && !editMode}
                fullWidth
              />
            </Grid>
          </Grid>
        </Collapse>
      )}
    </Box>
  );
};

export default LocationAccessFormDialog;
