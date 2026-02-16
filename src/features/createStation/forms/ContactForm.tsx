import React, {useState} from 'react';
import useContactForm from '~/features/stamdata/components/stationDetails/contacts/api/useContactForm';
import {ContactTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import AddContactInfo from '~/features/stamdata/components/stationDetails/contacts/AddContactInfo';
import {lowerCase} from 'lodash';
import {setRoleName} from '~/features/stamdata/components/stationDetails/contacts/const';
import SimpleContactList from '../helper/SimpleContactList';
import {Box, IconButton, Typography} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';

const ContactForm = () => {
  const {isMobile} = useBreakpoints();
  const [contactDialogOpen, setContactDialogOpen] = useState<boolean>(false);
  const [contacts, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.location?.contacts,
    state.setState,
    state.deleteState,
  ]);
  const contactInfoMethods = useContactForm<ContactTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: ContactTable[]) => {
    setState('location.contacts', value);
  };

  const removeContact = (index: number) => {
    const filteredContacts = (contacts || []).filter((_, i) => i !== index);
    onValidChange(filteredContacts);
  };

  const show = contacts !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="row" alignItems={'start'}>
        {!isMobile && (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              deleteState('location.contacts');
            }}
          >
            <RemoveCircleOutline fontSize="small" />
          </IconButton>
        )}
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  deleteState('location.contacts');
                }}
              >
                <Typography variant="body2" color="grey.700">
                  Kontakter
                </Typography>
              </Button>
            ) : (
              'Kontakter'
            )
          }
          labelPosition={-20}
          sx={{width: '100%', p: 1}}
        >
          <FormProvider {...contactInfoMethods}>
            <Box width={'100%'} display={'flex'} flexDirection={'column'}>
              {contacts && (
                <SimpleContactList
                  values={contacts.map((item) => {
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
                  px: '6.5px',
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
                setOpen={(open) => {
                  setContactDialogOpen(open);
                }}
                onValidate={(data) => {
                  data.contact_type = lowerCase(data.contact_type || '');

                  onValidChange([
                    ...contacts,
                    {
                      ...data,
                      contact_role_name: setRoleName(data.contact_role || 0),
                      mobile: data.mobile ?? null,
                    },
                  ]);
                  setContactDialogOpen(false);
                }}
              />
            )}
          </FormProvider>
        </FormFieldset>
      </Box>
    );

  return (
    <Box alignItems={'center'}>
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
          setState('location.contacts', []);
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj kontakter
        </Typography>
      </Button>
    </Box>
  );
};

export default ContactForm;
