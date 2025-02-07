import {zodResolver} from '@hookform/resolvers/zod';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {Box, Grid, useMediaQuery, useTheme} from '@mui/material';
import React, {useContext, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import Button from '~/components/Button';
import {initialContactData} from '~/consts';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import ContactInfoTable from '~/features/stamdata/components/stationDetails/contacts/ContactInfoTable';
import SelectContactInfo from '~/features/stamdata/components/stationDetails/contacts/SelectContactInfo';
import {contact_info} from '~/features/stamdata/components/stationDetails/zodSchemas';
import {MetadataContext} from '~/state/contexts';
import {ContactTable} from '~/types';

const ContactInfo = () => {
  const metadata = useContext(MetadataContext);
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const loc_id = metadata?.loc_id;
  const {del: deleteContact, put: editContact} = useContactInfo(loc_id);

  const formMethods = useForm({
    resolver: zodResolver(contact_info),
    defaultValues: initialContactData,
    mode: 'onSubmit',
  });

  const {reset} = formMethods;

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
        telefonnummer: contactInfo.telefonnummer,
        email: contactInfo.email,
        contact_role: contactInfo.contact_role,
        comment: contactInfo.comment,
        org: contactInfo.org,
        user_id: contactInfo.user_id ?? null,
        relation_id: contactInfo.relation_id,
        contact_type: contactInfo.contact_type,
      },
    };

    editContact.mutate(payload, {
      onSuccess: () => {
        reset(initialContactData);
      },
    });
  };

  return (
    <FormProvider {...formMethods}>
      <Grid container spacing={1} my={1}>
        <Grid item xs={matches ? 12 : 6} md={6} sm={matches ? 6 : 12}>
          <Box>
            <Button
              size="small"
              color="primary"
              bttype="primary"
              sx={matches ? {ml: 1} : {textTransform: 'none', ml: '12px'}}
              startIcon={<PersonAddIcon />}
              onClick={() => {
                reset();
                setOpenContactInfoDialog(true);
              }}
            >
              Tilføj kontakt
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} sm={12}>
          {openContactInfoDialog && (
            <SelectContactInfo open={openContactInfoDialog} setOpen={setOpenContactInfoDialog} />
          )}
        </Grid>
        <Grid item xs={12} sm={12}>
          <ContactInfoTable delContact={handleDelete} editContact={handleEdit} />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default ContactInfo;
