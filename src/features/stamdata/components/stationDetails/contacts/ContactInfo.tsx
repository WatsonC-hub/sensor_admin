import {Grid} from '@mui/material';
import React, {useContext} from 'react';
import {useFormContext} from 'react-hook-form';

import {initialContactData} from '~/consts';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import {MetadataContext} from '~/state/contexts';
import {ContactTable} from '~/types';

import ContactInfoTable from './ContactInfoTable';
import SelectContactInfo from './SelectContactInfo';

const ContactInfo = () => {
  const metadata = useContext(MetadataContext);
  const loc_id: number | undefined = metadata?.loc_id;
  const {setValue} = useFormContext();
  const {
    get: {data: contactTableInfo},
    del: deleteContact,
    put: editContact,
  } = useContactInfo(loc_id);

  const handleDelete = (relation_id: number) => {
    const payload = {
      path: `${relation_id}`,
    };

    deleteContact.mutate(payload);
  };

  const handleEdit = (contactInfo: ContactTable) => {
    const payload = {
      path: `${loc_id}`,
      data: {
        id: contactInfo.id,
        navn: contactInfo.navn,
        telefonnummer: contactInfo.telefonnummer ?? null,
        email: contactInfo.email,
        rolle: contactInfo.rolle,
        kommentar: contactInfo.kommentar,
        org: contactInfo.org,
        user_id: contactInfo.user_id ?? null,
        relation_id: contactInfo.relation_id,
      },
    };

    editContact.mutate(payload, {
      onSuccess: () => {
        setValue('contact_info', initialContactData);
      },
    });
  };

  return (
    <Grid container spacing={1} my={1}>
      <Grid item xs={12} sm={12}>
        <SelectContactInfo />
      </Grid>
      <Grid item xs={12} sm={12}>
        <ContactInfoTable
          data={contactTableInfo}
          delContact={handleDelete}
          editContact={handleEdit}
        />
      </Grid>
    </Grid>
  );
};

export default ContactInfo;
