import React, {useEffect, useState} from 'react';
import useContactForm from '~/features/stamdata/components/stationDetails/contacts/api/useContactForm';
import {ContactTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import AddContactInfo from '~/features/stamdata/components/stationDetails/contacts/AddContactInfo';
import {lowerCase} from 'lodash';
import {setRoleName} from '~/features/stamdata/components/stationDetails/contacts/const';
import SimpleContactList from '../helper/SimpleContactList';
import {Box} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {AddCircleOutline, DoNotDisturb, Edit} from '@mui/icons-material';
import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';
import {button_sx} from '../common_style';
import {useProjectContacts} from '~/features/stamdata/api/useContactInfo';
import {CreateLocationData} from '../types';

const ContactForm = () => {
  const {isMobile} = useBreakpoints();
  const [contactDialogOpen, setContactDialogOpen] = useState<boolean>(false);
  const [contacts, location, setState, deleteState, registerSubmitter, removeSubmitter] =
    useCreateStationStore((state) => [
      state.formState.location?.contacts,
      state.formState.location,
      state.setState,
      state.deleteState,
      state.registerSubmitter,
      state.removeSubmitter,
    ]);
  const {data} = useProjectContacts((location?.meta as CreateLocationData)?.initial_project_no);

  const mergedContacts = React.useMemo(() => {
    if (!data) return contacts;
    const projectContacts = data.map((contact) => ({
      ...contact,
      contact_role_name: contact.contact_role_name,
    }));
    const existingContacts = contacts || [];
    const merged = [...existingContacts];
    projectContacts.forEach((projectContact) => {
      if (!existingContacts.some((existing) => existing.id === projectContact.id)) {
        merged.push(projectContact);
      }
    });
    return merged.sort((a, b) => {
      if (a.contact_role && b.contact_role) {
        return a.contact_role - b.contact_role;
      }
      return 0;
    });
  }, [data, contacts]);

  const contactInfoMethods = useContactForm<ContactTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: ContactTable[] | undefined) => {
    setState('location.contacts', value);
  };

  const removeContact = (contact_id: string) => {
    const filteredContacts = (contacts || []).filter((contact) => contact.id !== contact_id);
    if (filteredContacts.length === 0) onValidChange([]);
    else onValidChange(filteredContacts);
  };

  useEffect(() => {
    registerSubmitter('location.contacts', () => {
      if (Array.isArray(mergedContacts) || !Object.keys(location || {}).includes('contacts')) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    });

    return () => removeSubmitter('location.contacts');
  }, [mergedContacts, location]);

  return (
    <FormFieldset label={'Kontakter'} sx={{p: 1, width: '100%'}}>
      <FormProvider {...contactInfoMethods}>
        <Box display={'flex'} flexDirection={'column'}>
          <SimpleContactList values={mergedContacts} onRemove={removeContact} />

          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            justifyContent={'flex-start'}
            gap={1}
          >
            <Button
              bttype="primary"
              startIcon={<AddCircleOutline />}
              sx={{
                ...button_sx(contacts !== undefined && contacts.length > 0),
                alignSelf: isMobile ? 'start' : 'center',
              }}
              onClick={() => {
                setContactDialogOpen(true);
              }}
            >
              Tilføj
            </Button>
            <Button
              bttype="primary"
              disabled={contacts && contacts.length > 0}
              startIcon={<DoNotDisturb />}
              sx={{
                ...button_sx(contacts !== undefined && contacts.length === 0),
                alignSelf: isMobile ? 'start' : 'center',
              }}
              onClick={() => {
                setState('location.contacts', []);
              }}
            >
              Ingen kontakter
            </Button>

            <Button
              bttype="primary"
              disabled={contacts && contacts.length > 0}
              startIcon={<Edit />}
              sx={{
                ...button_sx(contacts === undefined),
                alignSelf: isMobile ? 'start' : 'center',
              }}
              onClick={() => {
                deleteState('location.contacts');
              }}
            >
              Registrer senere
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
  );
};

export default ContactForm;
