import {Box, Collapse, Grid, Typography} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import ExtendedAutocomplete from '~/components/Autocomplete';
import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {initialLocationAccessData} from '~/consts';
import {useSearchContact} from '~/features/stamdata/api/useContactInfo';
import {AccessType} from '~/helpers/EnumHelper';
import {Access, ContactInfo} from '~/types';

type Props = {
  loc_id: number | undefined;
  editMode?: boolean;
  createNew?: boolean;
  setCreateNew?: (createNew: boolean) => void;
};

const LocationAccessFormDialog = ({loc_id, editMode, createNew, setCreateNew}: Props) => {
  const [selectedContactInfo, setSelectedContactInfo] = useState<ContactInfo | null>(null);
  const {control, watch, reset, setValue} = useFormContext<Access>();
  const [search, setSearch] = useState<string>('');
  const {data} = useSearchContact(loc_id, search);

  const contact_id = watch('contact_id');
  const contact_name = watch('contact_name');
  const email = watch('email');
  const org_name = watch('org_name');
  const navnLabel = watch('type');
  const location_access_id = watch('id');

  const merged_data = useMemo(() => {
    let merged_data = [...(data ?? [])];
    const existing = data?.find((c) => c.id === contact_id);
    if (!existing) {
      const contact: ContactInfo = {
        id: contact_id ?? '',
        name: contact_name ?? '',
        email: email ?? '',
        org: org_name ?? '',
        loc_id: loc_id ?? -1,
        contact_role: -1,
        mobile: '',
        contact_type: '',
      };

      merged_data = [...merged_data, contact].sort((a, b) =>
        a.name.localeCompare(b.name, 'da', {sensitivity: 'base'})
      );
    }
    return merged_data;
  }, [data, location_access_id, createNew]);

  useEffect(() => {
    if (selectedContactInfo == null || selectedContactInfo.id !== contact_id) {
      const contact = merged_data?.find((c) => c.id === contact_id) ?? null;
      setSearch(contact ? contact.name : '');
    }
  }, [contact_id, createNew]);

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
                } else setSelectedContactInfo(null);

                if (setCreateNew) setCreateNew(!createNew);
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
                  options={[{Kode: AccessType.Code}, {Nøgle: AccessType.Key}]}
                  required
                  fullWidth
                  disabled={location_access_id !== -1 && editMode !== false}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contact_id"
                  control={control}
                  render={({field: {onChange}}) => (
                    <>
                      <ExtendedAutocomplete<ContactInfo>
                        options={merged_data ?? []}
                        labelKey="name"
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
                        selectValue={selectedContactInfo}
                        inputValue={search}
                        renderOption={(props, option) => {
                          return (
                            <li {...props} key={option.id + ' - ' + option.loc_id}>
                              <Box display={'flex'} flexDirection={'column'}>
                                <Typography>{option.name}</Typography>
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
