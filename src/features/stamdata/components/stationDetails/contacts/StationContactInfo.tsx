import {Call, Email} from '@mui/icons-material';
import {Grid, InputAdornment, IconButton, Checkbox, FormControlLabel} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FormInput from '~/components/FormInput';
import {ContactInfoType} from '~/helpers/EnumHelper';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {InferContactInfo} from './api/useContactForm';

interface ModalProps {
  isEditing: boolean;
  setIsEditing?: (isEditing: boolean) => void;
  tableModal?: boolean;
  isUser: boolean;
}

type ContactRole = {
  id: number;
  name: string;
  default_type?: 'lokation' | 'projekt';
};

export default function StationContactInfo({
  isEditing,
  setIsEditing,
  isUser,
  tableModal = false,
}: ModalProps) {
  const {setValue, getValues, watch, control} = useFormContext<InferContactInfo>();
  const regEx = new RegExp(/(?:(?:00|\+)?45)?\d{8}/);
  const {data: contactRoles} = useQuery({
    queryKey: queryKeys.contactRoles(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<ContactRole>>(
        `/sensor_field/stamdata/contact/contact_roles`
      );

      return data;
    },
    staleTime: 1000 * 60 * 24, // 24 hours
  });

  const id = setIsEditing && watch('id');
  const mobile = watch('mobile');
  const contact_role = watch('contact_role');

  useEffect(() => {
    if (setIsEditing) {
      if (id) setIsEditing(true);
      else setIsEditing(false);
    }
  }, [id]);

  return (
    <Grid container spacing={1} my={1} alignItems="center">
      <Grid item xs={12} sm={6}>
        <FormInput
          name="name"
          label="Navn"
          placeholder="Navn på kontakten..."
          required
          fullWidth
          disabled={(!isEditing && isUser) || (isUser && isEditing)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="email"
          label="Email"
          placeholder="Email på kontakten..."
          type={'email'}
          fullWidth
          disabled={(!isEditing && isUser) || (isUser && isEditing)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    window.location.href = `mailto:${getValues('email')}`;
                  }}
                >
                  {tableModal && <Email />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="mobile"
          label="Tlf. nummer"
          placeholder="Telefonnummer..."
          fullWidth
          disabled={(!isEditing && isUser) || (isUser && isEditing)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disabled={!mobile || !regEx.test(mobile.toString())}
                  onClick={() => {
                    window.location.href = `tel:${getValues('mobile')}`;
                  }}
                >
                  {tableModal && <Call />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="contact_role"
          label="Rolle"
          placeholder="Vælg rolle..."
          disabled={tableModal}
          required
          select
          options={contactRoles?.map((role) => ({[role.id]: role.name}))}
          keyType="number"
          fullWidth
          onChangeCallback={(value) => {
            if (typeof value == 'number') return;
            const role = contactRoles?.find(
              (role) =>
                role.id === Number((value as React.ChangeEvent<HTMLInputElement>).target.value)
            );

            if (role?.id === 1 && getValues('notify_required') === true)
              setValue('notify_required', false);

            if (role && role.default_type !== null) {
              setValue('contact_type', role.default_type);
            } else {
              const contact_type = getValues('contact_type');
              if (contact_type === undefined) setValue('contact_type', 'lokation');
            }
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="contact_type"
          label="Tilknyt til"
          placeholder="Tilknyt..."
          disabled={tableModal}
          select
          options={[{lokation: ContactInfoType.Lokation}, {projekt: ContactInfoType.Projekt}]}
          required
          fullWidth
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Controller
          control={control}
          name="notify_required"
          rules={{required: false}}
          render={({field: {onChange, value}}) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={value ?? false}
                  disabled={tableModal || contact_role === 1}
                  onChange={(checked) => onChange(checked)}
                  name="notify_required"
                  color="primary"
                />
              }
              label="Kontaktes inden besøg"
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={12}>
        <FormInput
          name="comment"
          label="Kommentar"
          disabled={tableModal}
          multiline
          placeholder="Eks. kan kun kontaktes mellem 9-10 på telefonnummer..."
          fullWidth
        />
      </Grid>
    </Grid>
  );
}
