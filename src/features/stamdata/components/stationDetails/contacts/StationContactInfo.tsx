import {MenuItem, Grid} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useFormContext} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FormInput from '~/components/FormInput';
import {ContactInfoType} from '~/helpers/EnumHelper';

import {InferContactInfo} from '../zodSchemas';

interface ModalProps {
  modal: boolean;
  tableModal?: boolean;
  isUser: boolean;
}

type ContactRole = {
  id: number;
  name: string;
  default_type?: 'lokation' | 'projekt';
};

export default function StationContactInfo({modal, isUser, tableModal = false}: ModalProps) {
  const {setValue} = useFormContext<InferContactInfo>();

  const {data: contactRoles} = useQuery({
    queryKey: ['contact_roles'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<ContactRole>>(
        `/sensor_field/stamdata/contact_roles`
      );

      return data;
    },
  });

  return (
    <Grid container spacing={1} my={1}>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="navn"
          label="Navn"
          placeholder="Navn på kontakten..."
          required
          fullWidth
          disabled={modal || isUser}
          sx={{
            mb: 2,
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormInput
          name="email"
          label="Email"
          placeholder="Email på kontakten..."
          type={'email'}
          required
          fullWidth
          disabled={modal || isUser}
          sx={{
            mb: 2,
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
          disabled={modal || isUser}
          sx={{
            mb: 2,
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
          sx={{mb: 2}}
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
          sx={{mb: 2}}
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
          sx={{
            mb: 2,
          }}
        />
      </Grid>
    </Grid>
  );
}
