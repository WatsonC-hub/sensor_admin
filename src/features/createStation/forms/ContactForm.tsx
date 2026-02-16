import React, {useState} from 'react';
import useContactForm from '~/features/stamdata/components/stationDetails/contacts/api/useContactForm';
import {ContactTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import AddContactInfo from '~/features/stamdata/components/stationDetails/contacts/AddtContactInfo';
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
  const [show, setShow] = useState<boolean>(false);
  const [contactDialogOpen, setContactDialogOpen] = useState<boolean>(false);
  const [contacts, setContacts, deleteState] = useCreateStationStore((state) => [
    state.formState.location?.contacts,
    state.setState,
    state.deleteState,
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
    if (filteredContacts.length === 0) {
      setShow(false);
    }
    onValidChange(filteredContacts);
  };

  if (!show)
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
            setShow(true);
            setContactDialogOpen(true);
          }}
        >
          <Typography variant="body1" color="primary">
            Tilføj kontakter
          </Typography>
        </Button>
      </Box>
    );

  return (
    <Box display="flex" flexDirection="row" gap={1} alignItems={'center'}>
      {!isMobile && (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setShow(false);
            deleteState('location.contacts');
          }}
        >
          <RemoveCircleOutline fontSize="small" />
        </IconButton>
      )}
      <FormFieldset
        label={
          isMobile && show ? (
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" />}
              onClick={() => {
                setShow(false);
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
                if (contacts === undefined || contacts.length === 0) setShow(open);
              }}
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
                setContactDialogOpen(false);
              }}
            />
          )}
        </FormProvider>
      </FormFieldset>
    </Box>
  );
};

export default ContactForm;
