import React, {useEffect} from 'react';
import {Add} from '@mui/icons-material';
import useContactForm from '../../../stamdata/components/stationDetails/contacts/api/useContactForm';
import {ContactTable} from '~/types';
import Button from '~/components/Button';
import {FormProvider} from 'react-hook-form';
import SelectContactInfo from '../../../stamdata/components/stationDetails/contacts/SelectContactInfo';
import {lowerCase} from 'lodash';
import {setRoleName} from '../../../stamdata/components/stationDetails/contacts/const';
import {LocationController} from '../controller/types';
import SimpleContactList from '../helper/SimpleContactList';
import {Box} from '@mui/material';

type ContactInfoProps = {
  controller: LocationController | undefined;
};

const ContactForm = ({controller}: ContactInfoProps) => {
  const [contactDialogOpen, setContactDialogOpen] = React.useState<boolean>(false);
  // const contacts = useControllerValues<LocationPayload, 'contacts'>(controller, 'contacts');
  const contacts = controller?.getValues().contacts;
  const [, forceRender] = React.useState(0);
  const contactInfoMethods = useContactForm<ContactTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const {
    trigger,
    reset,
    formState: {isValid},
  } = contactInfoMethods;

  const onValidChange = (isValid: boolean, value?: ContactTable[]) => {
    controller?.updateSlice('contacts', isValid, value);
  };

  const onEdit = (index: number, data?: ContactTable) => {
    if (data) {
      const updatedContacts = (contacts || []).map((contact, i) => (i === index ? data : contact));
      onValidChange(isValid, updatedContacts);
      reset();
    }
  };

  const removeContact = (index: number) => {
    const filteredContacts = (contacts || []).filter((_, i) => i !== index);
    onValidChange(true, filteredContacts);
  };

  useEffect(() => {
    controller?.registerSlice('contacts', false, async () => {
      const isValid = await trigger();
      return isValid;
    });
  }, [controller]);

  useEffect(() => {
    if (!controller) return;

    const unsub = controller.onSliceChange((id) => {
      if (id === 'contacts') {
        forceRender((x) => x + 1);
      }
    });

    return () => {
      unsub();
    };
  }, [controller]);

  return (
    <FormProvider {...contactInfoMethods}>
      <Box width={'100%'} display={'flex'} flexDirection={'column'}>
        <SimpleContactList
          values={(controller?.getValues().contacts || []).map((item) => {
            return {name: item.name, email: item.email ?? ''};
          })}
          onEdit={onEdit}
          onRemove={removeContact}
        />
        <Button
          bttype="primary"
          startIcon={<Add />}
          onClick={() => {
            setContactDialogOpen(true);
          }}
          sx={{ml: 'auto', alignSelf: 'end'}}
        >
          Tilføj ny kontakt
        </Button>
      </Box>
      {contactDialogOpen && (
        <SelectContactInfo
          open={contactDialogOpen}
          setOpen={setContactDialogOpen}
          onValidate={(data) => {
            data.contact_type = lowerCase(data.contact_type || '');

            onValidChange(isValid, [
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
  );
};

export default ContactForm;
