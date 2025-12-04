import React from 'react';
import ContactInfoTable from './ContactInfoTable';
import {Add} from '@mui/icons-material';
import useContactForm from './api/useContactForm';
import {ContactTable} from '~/types';
import Button from '~/components/Button';
import useCreateStationContext from '~/features/station/createStation/api/useCreateStationContext';
import {FormProvider} from 'react-hook-form';
import SelectContactInfo from './SelectContactInfo';
import {lowerCase} from 'lodash';
import {setRoleName} from './const';

type ContactInfoProps = {
  loc_id?: number;
  mode: 'add' | 'edit' | 'mass_edit';
  defaultContacts: Array<ContactTable> | undefined;
};

const ContactForm = ({loc_id, mode, defaultContacts}: ContactInfoProps) => {
  const {formState, onValidate} = useCreateStationContext();
  const [currentIndex, setCurrentIndex] = React.useState<number>(-1);
  const [contactDialogOpen, setContactDialogOpen] = React.useState<boolean>(false);

  const contactInfoMethods = useContactForm<ContactTable>({
    defaultValues: undefined,
    mode: mode,
  });

  const onEdit = (index: number, data?: ContactTable) => {
    setCurrentIndex(index);
    if (data) {
      onValidate(
        'contacts',
        formState.contacts?.map((contact: ContactTable, i: number) =>
          i === index ? data : contact
        )
      );
    }
  };

  const removeContact = (index: number) => {
    onValidate(
      'contacts',
      formState.contacts?.filter((_: ContactTable, i: number) => i !== index)
    );
  };

  return (
    <FormProvider {...contactInfoMethods}>
      <ContactInfoTable
        mode={mode}
        loc_id={loc_id}
        contacts={defaultContacts}
        removeContact={removeContact}
        alterContact={onEdit}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
      {contactDialogOpen && (
        <SelectContactInfo
          open={contactDialogOpen}
          setOpen={setContactDialogOpen}
          loc_id={loc_id}
          onValidate={(data) => {
            data.contact_type = lowerCase(data.contact_type || '');
            onValidate('contacts', [
              ...(defaultContacts || []),
              {...data, contact_role_name: setRoleName(data.contact_role || 0)},
            ]);
          }}
        />
      )}
      {mode === 'add' && (
        <Button
          bttype="primary"
          startIcon={<Add />}
          disabled={loc_id !== undefined}
          onClick={() => {
            setContactDialogOpen(true);
            setCurrentIndex(-1);
          }}
          sx={{ml: 'auto'}}
        >
          Tilføj ny kontakt
        </Button>
      )}
    </FormProvider>
  );
};

export default ContactForm;
