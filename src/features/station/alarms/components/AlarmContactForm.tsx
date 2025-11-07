import React from 'react';
import {AlarmContactFormType, AlarmsFormValues} from '../schema';

import {useFormContext} from 'react-hook-form';

import {Add} from '@mui/icons-material';
import Button from '~/components/Button';
import AlarmContactTable from './AlarmContactTable';

const removeContact = (index: number, contacts: AlarmContactFormType[]) => {
  return contacts.filter((_, i) => i !== index);
};

type AlarmContactFormProps = {
  setContactDialogOpen: (open: boolean) => void;
  setMode: (mode: 'add' | 'edit' | 'view') => void;
  setCurrentIndex: (index: number) => void;
};

const AlarmContactForm = ({
  setContactDialogOpen,
  setMode,
  setCurrentIndex,
}: AlarmContactFormProps) => {
  const {watch, setValue} = useFormContext<AlarmsFormValues>();
  const contacts = watch('contacts');

  return (
    <>
      {contacts &&
        contacts.filter((contact) => contact !== undefined || contact !== null).length > 0 && (
          <AlarmContactTable
            alarmContacts={contacts}
            onEdit={(index) => {
              setMode('edit');
              setCurrentIndex(index);
              setContactDialogOpen(true);
            }}
            onDelete={(index) => setValue('contacts', removeContact(index, contacts))}
          />
        )}
      <Button
        bttype="primary"
        startIcon={<Add />}
        onClick={() => {
          setMode('add');
          setContactDialogOpen(true);
          setCurrentIndex(-1);
        }}
        sx={{ml: 'auto'}}
      >
        Tilføj ny kontakt
      </Button>
    </>
  );
};

export default AlarmContactForm;
