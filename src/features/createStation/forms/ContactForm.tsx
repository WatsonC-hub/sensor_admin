import React from 'react';
import useContactForm from '~/features/stamdata/components/stationDetails/contacts/api/useContactForm';
import {ContactTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import AddContactInfo from '~/features/stamdata/components/stationDetails/contacts/AddtContactInfo';
import {lowerCase} from 'lodash';
import {setRoleName} from '~/features/stamdata/components/stationDetails/contacts/const';
import SimpleContactList from '../helper/SimpleContactList';
import {Box, Typography} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {AddCircleOutline} from '@mui/icons-material';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';

const ContactForm = () => {
  const [contactDialogOpen, setContactDialogOpen] = React.useState<boolean>(false);
  const {isMobile} = useBreakpoints();
  const [contacts, setContacts] = useCreateStationStore((state) => [
    state.formState.location?.contacts,
    state.setState,
  ]);
  const contactInfoMethods = useContactForm<ContactTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: ContactTable[]) => {
    setContacts('location.contacts', value);
  };

  const removeContact = (index: number) => {
    const filteredContacts = (contacts || []).filter((_, i) => i !== index);
    onValidChange(filteredContacts);
  };

  return (
    <FormFieldset
      label={'Kontakter'}
      labelPosition={isMobile ? -22 : -20}
      sx={{width: '100%', p: 1}}
    >
      <FormProvider {...contactInfoMethods}>
        <Box width={'100%'} display={'flex'} flexDirection={'column'}>
          {contacts && contacts.length > 0 && (
            <SimpleContactList
              values={(contacts || []).map((item) => {
                return {name: item.name, email: item.email ?? ''};
              })}
              onRemove={removeContact}
            />
          )}
          <Button
            bttype="primary"
            startIcon={<AddCircleOutline color="primary" />}
            sx={{
              width: 'fit-content',
              backgroundColor: 'transparent',
              border: 'none',
              px: 1,
              ':hover': {
                backgroundColor: 'grey.200',
              },
            }}
            onClick={() => {
              setContactDialogOpen(true);
            }}
          >
            <Typography variant="body1" color="primary">
              Tilføj kontakt
            </Typography>
          </Button>
        </Box>
        {contactDialogOpen && (
          <AddContactInfo
            open={contactDialogOpen}
            setOpen={setContactDialogOpen}
            onValidate={(data) => {
              data.contact_type = lowerCase(data.contact_type || '');

              onValidChange([
                ...(contacts || []),
                {
                  ...data,
                  contact_role_name: setRoleName(data.contact_role || 0),
                  mobile: data.mobile ?? null,
                },
              ]);
            }}
          />
        )}
      </FormProvider>
    </FormFieldset>
  );
};

export default ContactForm;
