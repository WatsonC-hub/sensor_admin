import {Box, Collapse, Grid, MenuItem, Typography} from '@mui/material';
import React, {useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import ExtendedAutocomplete from '~/components/Autocomplete';
import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {initialLocationAccessData} from '~/consts';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import {AdgangsForhold} from '~/features/stamdata/components/stationDetails/zodSchemas';
import {AccessType} from '~/helpers/EnumHelper';
import {ContactInfo} from '~/types';

type Props = {
  loc_id: number | undefined;
  editMode?: boolean;
  createNew?: boolean;
  setCreateNew?: (createNew: boolean) => void;
};

const LocationAccessFormDialog = ({loc_id, editMode, createNew, setCreateNew}: Props) => {
  const [selectedContactInfo, setSelectedContactInfo] = useState<ContactInfo | null>(null);
  const {control, watch} = useFormContext<AdgangsForhold>();
  const {reset, setValue} = useFormContext<AdgangsForhold>();
  const [search, setSearch] = useState<string>('');

  const {useSearchContact} = useContactInfo(loc_id);
  const {data} = useSearchContact(search);

  const navnLabel = watch('type');
  const location_access_id = watch('id');

  return (
    <Box>
      <Grid container spacing={1}>
        {editMode === undefined && (
          <Grid item xs={12} sm={12}>
            <Button
              bttype="primary"
              onClick={() => {
                if (createNew) {
                  reset(initialLocationAccessData);
                  setValue('id', -1);
                }
                setCreateNew && setCreateNew(!createNew);
              }}
            >
              {createNew ? 'Annuller' : 'Påbegynd'} oprettelse af nøgle/kode
            </Button>
          </Grid>
        )}
        <Grid item xs={12} sm={12}>
          <Collapse in={createNew || editMode !== undefined}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <FormInput
                  name="type"
                  label="Type"
                  placeholder="Vælg en type..."
                  select
                  required
                  fullWidth
                  disabled={location_access_id !== -1 && editMode !== false}
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
                  name="contact_id"
                  control={control}
                  render={({field: {onChange}}) => (
                    <>
                      <ExtendedAutocomplete<ContactInfo>
                        options={data ?? []}
                        labelKey="navn"
                        onChange={(option) => {
                          if (option == null) {
                            onChange(null);
                            setSelectedContactInfo(null);
                            return;
                          }
                          if ('id' in option) {
                            onChange(option.id);
                            setSelectedContactInfo(option);
                          }
                        }}
                        selectValue={selectedContactInfo!}
                        filterOptions={(options) => {
                          return options;
                        }}
                        inputValue={search}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.id + ' - ' + option.loc_id}>
                              <Box display={'flex'} flexDirection={'column'}>
                                <Typography>{option.navn}</Typography>
                                <Typography fontStyle={'italic'} variant="body2">
                                  {option.email}
                                </Typography>
                                <Typography fontStyle={'italic'} variant="body2">
                                  {option.org && option.org !== '' && option.org}
                                </Typography>
                              </Box>
                            </li>
                          );
                        }}
                        textFieldsProps={{
                          label: 'Kontakt',
                          placeholder: 'Søg og vælg kontakt...',
                        }}
                        onInputChange={(event, value) => {
                          setSearch(value);
                        }}
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                      />

                      {/* <ExtendedAutocomplete<baseContactInfo>
                        options={contacts ?? []}
                        labelKey="navn"
                        error={error?.message}
                        disabled={location_access_id !== -1 && editMode !== false}
                        onChange={(option) => {
                          if (option == null) {
                            onChange(null);
                            return;
                          }
                          if ('id' in option) {
                            onChange(option.id);
                          }
                        }}
                        selectValue={
                          contacts.find((item) => item.id === value) ?? {
                            id: '-1',
                            navn: '',
                            email: '',
                          }
                        }
                        filterOptions={(options, params) => {
                          const {inputValue} = params;
                          const filter = options.filter(
                            (option) =>
                              (option.navn &&
                                option.navn.toLowerCase().includes(inputValue.toLowerCase())) ||
                              (option.email &&
                                option.email.toLowerCase().includes(inputValue.toLowerCase()))
                          );

                          return filter;
                        }}
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
                        textFieldsProps={{
                          label: 'Kontakt',
                          placeholder: 'Vælg kontakt',
                        }}
                      /> */}
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {navnLabel && navnLabel !== '-1' && (
                  <FormInput
                    name="navn"
                    label={navnLabel === AccessType.Code ? 'Navn' : 'Nøgle ID.'}
                    placeholder={
                      navnLabel === AccessType.Code
                        ? 'Eks. identificerbart navn...'
                        : 'Eks. et identificerbart tal...'
                    }
                    required
                    fullWidth
                    style={{marginBottom: 12}}
                    disabled={location_access_id !== -1 && editMode !== false}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                {navnLabel && navnLabel !== '-1' && (
                  <>
                    {navnLabel === AccessType.Code ? (
                      <FormInput
                        name="koden"
                        label={'Koden på låsen'}
                        placeholder="Eks. kode 2024 eller 3962..."
                        required
                        disabled={location_access_id !== -1 && editMode !== false}
                        fullWidth
                      />
                    ) : (
                      <FormInput
                        name="placering"
                        label={'Udleveres på adresse'}
                        placeholder="Eks. Østre Alle, 9000 Aalborg..."
                        required
                        disabled={location_access_id !== -1 && editMode !== false}
                        fullWidth
                      />
                    )}
                  </>
                )}
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormInput
                  name="kommentar"
                  label={'Kommentar'}
                  multiline
                  placeholder="F.eks. at det er tredje hænge lås eller det er koden til en dør..."
                  disabled={location_access_id !== -1 && editMode !== false}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocationAccessFormDialog;
