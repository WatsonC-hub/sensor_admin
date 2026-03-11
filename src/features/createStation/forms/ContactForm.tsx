import React, {useEffect, useState} from 'react';
import useContactForm from '~/features/stamdata/components/stationDetails/contacts/api/useContactForm';
import {ContactTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import AddContactInfo from '~/features/stamdata/components/stationDetails/contacts/AddContactInfo';
import {lowerCase} from 'lodash';
import {setRoleName} from '~/features/stamdata/components/stationDetails/contacts/const';
import SimpleContactList from '../helper/SimpleContactList';
import {Box, IconButton, Typography} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {AddCircleOutline, Check, DoNotDisturb, RemoveCircleOutline} from '@mui/icons-material';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';

const ContactForm = () => {
  const {isMobile} = useBreakpoints();
  const [contactDialogOpen, setContactDialogOpen] = useState<boolean>(false);
  // const [error, setError] = useState<string | undefined>(undefined);
  const [contacts, location, setState, deleteState, registerSubmitter, removeSubmitter] =
    useCreateStationStore((state) => [
      state.formState.location?.contacts,
      state.formState.location,
      state.setState,
      state.deleteState,
      state.registerSubmitter,
      state.removeSubmitter,
    ]);
  const contactInfoMethods = useContactForm<ContactTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: ContactTable[] | undefined) => {
    setState('location.contacts', value);
  };

  const removeContact = (index: number) => {
    const filteredContacts = (contacts || []).filter((_, i) => i !== index);
    if (filteredContacts.length === 0) onValidChange([]);
    else onValidChange(filteredContacts);
  };

  useEffect(() => {
    registerSubmitter('location.contacts', () => {
      if (Array.isArray(contacts) || !Object.keys(location || {}).includes('contacts')) {
        return Promise.resolve(true);
      }
      // setError('Tilføj en kontakt eller tryk på "Ikke relevant"');
      return Promise.resolve(false);
    });

    return () => removeSubmitter('location.contacts');
  }, [contacts, location]);

  // if (show)
  return (
    <Box display="flex" flexDirection="row" alignItems={'start'}>
      <FormFieldset label={'Kontakter'} labelPosition={-20} sx={{width: '100%', p: 1}}>
        <FormProvider {...contactInfoMethods}>
          <Box width={'100%'} display={'flex'} flexDirection={'column'}>
            <SimpleContactList values={contacts} onRemove={removeContact} />

            <Box display="flex" flexDirection="row" justifyContent={'flex-start'} gap={1}>
              <Button
                bttype="primary"
                startIcon={<AddCircleOutline />}
                sx={{
                  width: 'fit-content',
                  backgroundColor: 'transparent',
                  border: 'none',
                  px: '6.5px',
                  color: 'primary.main',
                  ':hover': {
                    backgroundColor: 'grey.200',
                  },
                }}
                // disabled={contacts === undefined}
                onClick={() => {
                  setContactDialogOpen(true);
                }}
              >
                <Typography variant="body1">Tilføj</Typography>
              </Button>
              <Button
                bttype="primary"
                startIcon={<DoNotDisturb />}
                sx={{
                  width: 'fit-content',
                  backgroundColor: 'transparent',
                  border: 'none',
                  px: '6.5px',
                  color: 'primary.main',
                  ':hover': {
                    backgroundColor: 'grey.200',
                  },
                }}
                disabled={Array.isArray(contacts)}
                onClick={() => {
                  setState('location.contacts', []);
                }}
              >
                <Typography variant="body1">Ingen kontakter</Typography>
              </Button>

              <Button
                bttype="primary"
                startIcon={<RemoveCircleOutline />}
                sx={{
                  width: 'fit-content',
                  backgroundColor: 'transparent',
                  border: 'none',
                  px: '6.5px',
                  color: 'primary.main',
                  ':hover': {
                    backgroundColor: 'grey.200',
                  },
                }}
                disabled={(Array.isArray(contacts) && contacts.length > 0) || contacts == undefined}
                onClick={() => {
                  deleteState('location.contacts');
                }}
              >
                <Typography variant="body1">Registrer senere</Typography>
              </Button>
            </Box>
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

  // return (
  //   <Box alignItems={'center'}>
  //     <Button
  //       bttype="primary"
  //       startIcon={<AddCircleOutline color="primary" />}
  //       sx={{
  //         width: 'fit-content',
  //         backgroundColor: 'transparent',
  //         border: 'none',
  //         px: 1,
  //         ':hover': {
  //           backgroundColor: 'grey.200',
  //         },
  //       }}
  //       onClick={() => {
  //         setState('location.contacts', undefined);
  //       }}
  //     >
  //       <Typography variant="body1" color="primary">
  //         Tilføj kontakter
  //       </Typography>
  //     </Button>
  //   </Box>
  // );
};

export default ContactForm;
