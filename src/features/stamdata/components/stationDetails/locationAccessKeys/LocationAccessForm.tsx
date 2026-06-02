import {Box, Collapse, Divider, Grid2, Typography} from '@mui/material';
import React, {useEffect, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import Button from '~/components/Button';
import {useSearchContact} from '~/features/stamdata/api/useContactInfo';
import {AccessType} from '~/helpers/EnumHelper';
import {Access, ContactInfo} from '~/types';
import SelectLocationAccess from './SelectLocationAccess';
import {initialLocationAccessData} from '~/consts';
import {TypedFormComponent} from '~/components/formComponents/Form';

type LocationAccessFormProps = {
  loc_id?: number | undefined;
  showLocationAccess?: boolean;
  disabled?: boolean;
  Form: TypedFormComponent<Access, Access>;
};

const LocationAccessForm = ({
  loc_id,
  showLocationAccess = false,
  disabled = false,
  Form,
}: LocationAccessFormProps) => {
  const [search, setSearch] = useState<string>('');
  const [showLocationAccessForm, setShowLocationAccessForm] = useState<boolean>(
    showLocationAccess ?? false
  );
  const {data} = useSearchContact(loc_id, search);
  const {watch, reset} = useFormContext<Access>();
  const location_access_id = watch('id');
  const contact_id = watch('contact_id');
  const contact_name = watch('contact_name');
  const email = watch('email');
  const org_name = watch('org_name');
  const navnLabel = watch('type');

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
  }, [data, location_access_id, showLocationAccessForm]);

  useEffect(() => {
    if (!showLocationAccessForm) {
      setSearch('');
    }
  }, [showLocationAccessForm]);

  return (
    <>
      {!disabled && (
        <>
          <SelectLocationAccess
            loc_id={loc_id}
            showLocationAccessForm={showLocationAccessForm}
            setShowLocationAccessForm={setShowLocationAccessForm}
            disabled={disabled}
            Form={Form}
          />
          <Divider sx={{bgcolor: 'primary.main', paddingTop: 0.1, paddingBottom: 0.1}} />
          <Button
            bttype="primary"
            onClick={() => {
              if (showLocationAccessForm) {
                reset(initialLocationAccessData);
              }

              if (setShowLocationAccessForm) setShowLocationAccessForm(!showLocationAccessForm);
            }}
            disabled={disabled}
          >
            {showLocationAccessForm ? 'Annuller' : 'Påbegynd'} oprettelse af nøgle/kode
          </Button>
        </>
      )}
      <Collapse in={showLocationAccessForm}>
        {showLocationAccessForm && (
          <Grid2 container spacing={1}>
            <Form.Input
              name="type"
              label="Type"
              placeholder="Vælg en type..."
              select
              options={[{Kode: AccessType.Code}, {Nøgle: AccessType.Key}]}
              required
              fullWidth
              disabled={disabled}
            />
            <Form.Autocomplete<ContactInfo>
              options={merged_data ?? []}
              valueKey="id"
              labelKey="name"
              name="contact_id"
              inputValue={search}
              onChangeCallback={(value) => {
                setSearch(value ? value.name : '');
              }}
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
                fullWidth: true,
              }}
              onInputChange={(event, value) => {
                setSearch(value);
              }}
              handleHomeEndKeys
              disabled={disabled}
            />
            {navnLabel && navnLabel !== '-1' && (
              <Form.Input
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
                disabled={disabled}
              />
            )}
            {navnLabel && navnLabel !== '-1' && (
              <>
                {navnLabel === AccessType.Code ? (
                  <Form.Input
                    name="koden"
                    label={'Koden på låsen'}
                    placeholder="Eks. kode 2024 eller 3962..."
                    required
                    disabled={disabled}
                    fullWidth
                  />
                ) : (
                  <Form.Input
                    name="placering"
                    label={'Udleveres på adresse'}
                    placeholder="Eks. Østre Alle, 9000 Aalborg..."
                    required
                    disabled={disabled}
                    fullWidth
                  />
                )}
              </>
            )}
            <Form.Input
              gridSizes={{xs: 12}}
              name="kommentar"
              label={'Kommentar'}
              multiline
              placeholder="F.eks. at det er tredje hænge lås eller det er koden til en dør..."
              disabled={disabled}
              fullWidth
            />
          </Grid2>
        )}
      </Collapse>
    </>
  );
};

export default LocationAccessForm;
