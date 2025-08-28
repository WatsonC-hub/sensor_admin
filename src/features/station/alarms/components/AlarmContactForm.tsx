import React, {useState} from 'react';
import {AlarmContactFormType, AlarmsFormValues} from '../schema';
import {Box, Checkbox, Divider, TextField, Typography} from '@mui/material';
import {useContactInfo, useSearchContact} from '~/features/stamdata/api/useContactInfo';
import {useAppContext} from '~/state/contexts';
import {useFormContext} from 'react-hook-form';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
import {Add, Edit} from '@mui/icons-material';
import Button from '~/components/Button';

// const defaultContact = {
//   contact_id: '',
//   name: '',
//   sms: {
//     sms: false,
//     to: undefined,
//     from: undefined,
//   },
//   email: {
//     email: false,
//     to: undefined,
//     from: undefined,
//   },
//   call: {
//     call: false,

//     to: undefined,
//     from: undefined,
//   },
// };

const removeContact = (index: number, contacts: AlarmContactFormType[]) => {
  return contacts.filter((_, i) => i !== index);
};

// const addContact = (contact: AlarmContactFormType, contacts: AlarmContactFormType[]) => {
//   return [...contacts, contact];
// };

// const triggerErrors = async (
//   trigger: (value: FieldPath<AlarmsFormValues>) => Promise<boolean>,
//   index: number,
//   path: keyof AlarmContactFormType
// ) => {
//   const result = await trigger(`contacts.${index}.${path}`);
//   return result;
// };

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
  const {loc_id} = useAppContext(['loc_id']);

  const {watch, setValue} = useFormContext<AlarmsFormValues>();
  const contacts = watch('contacts');

  const {data: contact_data} = useSearchContact(loc_id, '');

  if (!contact_data) return null;

  return (
    <>
      {contacts &&
        contacts.filter((contact) => contact !== undefined || contact !== null).length > 0 &&
        contacts.map((field, fieldIndex) => {
          return (
            <Box
              key={`contacts.${fieldIndex}`}
              display="flex"
              flexDirection="column"
              gap={1}
              width="100%"
            >
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                pb={2}
              >
                <Typography ml={2}>
                  {contact_data.find((c) => c.id === field?.contact_id)?.navn ?? 'Ukendt navn'}
                </Typography>
                <Box display="flex" flexDirection="row" alignItems={'center'} gap={1} mr={1}>
                  <Edit
                    color="action"
                    sx={{cursor: 'pointer'}}
                    onClick={() => {
                      setMode('edit');
                      setCurrentIndex(fieldIndex);
                      // resetField(`contacts.${fieldIndex}`);
                      setContactDialogOpen(true);
                    }}
                  />
                  <CloseIcon
                    color="action"
                    sx={{cursor: 'pointer'}}
                    onClick={() => setValue('contacts', removeContact(fieldIndex, contacts))}
                  />
                </Box>
              </Box>
              <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
                <Checkbox checked={!!field?.sms?.selected} disabled />
                <SmsIcon color="primary" />
                <TextField fullWidth value={field?.sms?.from} disabled />
                <TextField fullWidth value={field?.sms?.to} disabled />
              </Box>
              <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
                <Checkbox checked={!!field?.email?.selected} disabled />
                <EmailIcon color="primary" />
                <TextField fullWidth value={field?.email?.from} disabled />
                <TextField fullWidth value={field?.email?.to} disabled />
              </Box>
              <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
                <Checkbox checked={!!field?.call?.selected} disabled />
                <CallIcon color="primary" />
                <TextField fullWidth value={field?.call?.from} disabled />
                <TextField fullWidth value={field?.call?.to} disabled />
              </Box>
              {contacts.length - 1 !== fieldIndex && <Divider />}
            </Box>
          );
        })}
      <Button
        bttype="primary"
        startIcon={<Add />}
        onClick={() => {
          setMode('add');
          setContactDialogOpen(true);
          // if (contacts) {
          //   setValue('contacts', addContact(defaultContact, contacts));
          //   setCurrentIndex(contacts.length);
          // }
        }}
        sx={{ml: 'auto'}}
      >
        Tilføj ny kontakt
      </Button>
    </>
  );
};

export default AlarmContactForm;
