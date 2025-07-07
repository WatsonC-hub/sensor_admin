import {Call, Email} from '@mui/icons-material';
import {MenuItem, Grid, InputAdornment, IconButton} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FormInput from '~/components/FormInput';
import {InferContactInfo} from '~/features/stamdata/components/stationDetails/zodSchemas';
import {ContactInfoType} from '~/helpers/EnumHelper';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';

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
  const {setValue, getValues, watch} = useFormContext<InferContactInfo>();
  const regEx = new RegExp(/(?:(?:00|\+)?45)?\d{8}/);
  const {data: contactRoles} = useQuery({
    queryKey: queryKeys.contactRoles(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<ContactRole>>(
        `/sensor_field/stamdata/contact/contact_roles`
      );

      return data;
    },
  });

  const id = setIsEditing && watch('id');
  const telefonnummer = watch('telefonnummer');

  useEffect(() => {
    if (setIsEditing) {
      if (id) setIsEditing(true);
      else setIsEditing(false);
    }
  }, [id]);

  return (
    <Grid container spacing={1} my={1}>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="navn"
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
          name="telefonnummer"
          label="Tlf. nummer"
          placeholder="Telefonnummer..."
          type={'number'}
          fullWidth
          disabled={(!isEditing && isUser) || (isUser && isEditing)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  disabled={!telefonnummer || !regEx.test(telefonnummer.toString())}
                  onClick={() => {
                    window.location.href = `tel:${getValues('telefonnummer')}`;
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
          placeholder="Hvilken rolle har kontakten..."
          disabled={tableModal}
          select
          fullWidth
          onChangeCallback={(value) => {
            if (typeof value == 'number') return;
            const role = contactRoles?.find(
              (role) =>
                role.id === Number((value as React.ChangeEvent<HTMLInputElement>).target.value)
            );
            if (role) {
              setValue('contact_type', role.default_type ?? '-1');
            } else {
              setValue('contact_type', '-1');
            }
          }}
        >
          <MenuItem value={-1} key={-1}>
            Vælg rolle
          </MenuItem>
          {contactRoles?.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </FormInput>
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="contact_type"
          label="Tilknyt til"
          placeholder="Tilknyt..."
          disabled={tableModal}
          select
          required
          fullWidth
        >
          <MenuItem value={'-1'} key={'-1'}>
            Vælg type
          </MenuItem>
          <MenuItem value={ContactInfoType.Lokation}>Lokation</MenuItem>
          <MenuItem value={ContactInfoType.Projekt}>Projekt</MenuItem>
        </FormInput>
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
