import React, {useState} from 'react';
import {createTypedForm} from '~/components/formComponents/Form';
import {AlarmContactArrayFormValues, AlarmContactFormType} from '../schema';
import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2,
  TextField,
  Typography,
} from '@mui/material';
import {useSearchContact} from '~/features/stamdata/api/useContactInfo';
import {useAppContext} from '~/state/contexts';
import useDebouncedValue from '~/hooks/useDebouncedValue';
import {useFormContext} from 'react-hook-form';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
import {ContactInfo} from '~/types';
import {Add, Edit} from '@mui/icons-material';
import Button from '~/components/Button';

const AlarmContactTypedForm = createTypedForm<AlarmContactArrayFormValues>();

type TestAlarmContactType = {
  contact_id: string | undefined;
  name: string;
};

type TestAlarmContact = {
  contacts: TestAlarmContactType[];
};

const transformData = (data: ContactInfo[]) => {
  const alarmContacts: TestAlarmContact = {
    contacts: data.map((item) => ({
      contact_id: item.id ?? undefined,
      name: item.navn,
    })),
  };
  return alarmContacts;
};

const removeContact = (index: number, contacts: AlarmContactFormType[]) => {
  return contacts.filter((_, i) => i !== index);
};

const addContact = (contact: AlarmContactFormType, contacts: AlarmContactFormType[]) => {
  return [...contacts, contact];
};

const AlarmContactForm = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebouncedValue(search, 500);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('view');
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // number 67 is the id for the contact type "Alarm"
  const {data} = useSearchContact(loc_id, debouncedSearch, transformData);

  const {
    formState: {errors},
    watch,
    setValue,
    resetField,
  } = useFormContext<AlarmContactArrayFormValues>();
  const contacts = watch('contacts');
  const currentValues = currentIndex >= 0 ? watch(`contacts.${currentIndex}`) : null;

  return (
    <>
      {contacts.length > 0 &&
        mode === 'view' &&
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
                <Typography ml={2}>{field?.name}</Typography>
                <Box display="flex" flexDirection="row" alignItems={'center'} gap={1} mr={1}>
                  <Edit
                    color="action"
                    sx={{cursor: 'pointer'}}
                    onClick={() => {
                      setMode('edit');
                      setCurrentIndex(fieldIndex);
                      resetField(`contacts.${fieldIndex}`);
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
                <Checkbox checked={field.sms?.sms} disabled />
                <SmsIcon color="primary" />
                <TextField fullWidth value={field.sms?.from} type="time" disabled />
                <TextField fullWidth value={field.sms?.to} type="time" disabled />
              </Box>
              <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
                <Checkbox checked={field.email?.email} disabled />
                <EmailIcon color="primary" />
                <TextField fullWidth value={field.email?.from} type="time" disabled />
                <TextField fullWidth value={field.email?.to} type="time" disabled />
              </Box>
              <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
                <Checkbox checked={field.call?.call} disabled />
                <CallIcon color="primary" />
                <TextField fullWidth value={field.call?.from} type="time" disabled />
                <TextField fullWidth value={field.call?.to} type="time" disabled />
              </Box>
              {contacts.length - 1 !== fieldIndex && <Divider />}
            </Box>
          );
        })}

      <Dialog
        open={contactDialogOpen}
        onClose={() => {
          setContactDialogOpen(false);
          if (mode === 'add') setValue('contacts', removeContact(contacts.length - 1, contacts));
          else if (mode === 'edit') resetField(`contacts.${currentIndex}`);
          setMode('view');
        }}
        fullWidth
      >
        <DialogTitle>{mode === 'add' ? 'Tilføj kontakt' : 'Rediger kontakt'}</DialogTitle>
        <DialogContent sx={{width: '100%'}}>
          <Grid2 size={{xs: 12, sm: 12}} width={'100%'} direction={'row'} alignItems="center">
            <AlarmContactTypedForm.Autocomplete<TestAlarmContactType>
              options={data?.contacts ?? []}
              labelKey="name"
              name={`contacts.${currentIndex}`}
              label={`Kontakt`}
              gridSizes={{xs: 12, sm: 6}}
              error={errors?.contacts?.[currentIndex]?.contact_id?.message}
              inputValue={search}
              onSelectChange={(option) => {
                const updated = {
                  ...currentValues,
                  contact_id: option?.contact_id,
                  name: option?.name,
                };
                return updated;
              }}
              textFieldsProps={{
                label: 'Kontakt',
                placeholder: 'Søg og vælg kontakt...',
                required: true,
              }}
              onInputChange={(event, value) => {
                setSearch(value);
              }}
            />
          </Grid2>
          <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
            <AlarmContactTypedForm.Checkbox
              name={`contacts.${currentIndex}.sms.sms`}
              icon={<SmsIcon color="primary" />}
              gridSizes={{xs: 12, sm: 2}}
            />
            <Box
              key={`contacts.${currentIndex}.sms`}
              display="flex"
              flexDirection="row"
              width="100%"
              gap={1}
            >
              <AlarmContactTypedForm.Input
                name={`contacts.${currentIndex}.sms.from`}
                label="Start interval"
                type="time"
                disabled={!currentValues?.sms?.sms}
                gridSizes={{xs: 12, sm: 6}}
              />
              <AlarmContactTypedForm.Input
                name={`contacts.${currentIndex}.sms.to`}
                label="Slut interval"
                type="time"
                disabled={!currentValues?.sms?.sms}
                gridSizes={{xs: 12, sm: 6}}
              />
            </Box>
          </Box>
          <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
            <AlarmContactTypedForm.Checkbox
              name={`contacts.${currentIndex}.email.email`}
              icon={<EmailIcon color="primary" />}
              gridSizes={{xs: 12, sm: 2}}
            />
            <Box
              key={`contacts.${currentIndex}.email`}
              display="flex"
              flexDirection="row"
              width="100%"
              gap={1}
            >
              <AlarmContactTypedForm.Input
                name={`contacts.${currentIndex}.email.from`}
                label="Start interval"
                type="time"
                disabled={!currentValues?.email?.email}
                gridSizes={{xs: 12, sm: 6}}
              />
              <AlarmContactTypedForm.Input
                name={`contacts.${currentIndex}.email.to`}
                label="Slut interval"
                type="time"
                disabled={!currentValues?.email?.email}
                gridSizes={{xs: 12, sm: 6}}
              />
            </Box>
          </Box>
          <Box display="flex" flexDirection="row" alignItems={'center'} gap={1}>
            <AlarmContactTypedForm.Checkbox
              name={`contacts.${currentIndex}.call.call`}
              icon={<CallIcon color="primary" />}
              gridSizes={{xs: 12, sm: 2}}
            />
            <Box
              key={`contacts.${currentIndex}.call`}
              display="flex"
              flexDirection="row"
              width="100%"
              gap={1}
            >
              <AlarmContactTypedForm.Input
                name={`contacts.${currentIndex}.call.from`}
                label="Start interval"
                type="time"
                disabled={!currentValues?.call?.call}
                gridSizes={{xs: 12, sm: 6}}
              />
              <AlarmContactTypedForm.Input
                name={`contacts.${currentIndex}.call.to`}
                label="Slut interval"
                type="time"
                disabled={!currentValues?.call?.call}
                gridSizes={{xs: 12, sm: 6}}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            bttype="tertiary"
            onClick={() => {
              setContactDialogOpen(false);
              if (mode === 'add')
                setValue('contacts', removeContact(contacts.length - 1, contacts));
              else if (mode === 'edit') resetField(`contacts.${currentIndex}`);
              setMode('view');
            }}
          >
            Annuller
          </Button>
          <Button
            bttype="primary"
            onClick={() => {
              setContactDialogOpen(false);
              setMode('view');
            }}
            disabled={errors?.contacts?.[currentIndex] !== undefined}
            sx={{ml: 'auto'}}
          >
            {mode === 'add' ? 'Tilføj' : 'Gem'}
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        bttype="primary"
        startIcon={<Add />}
        onClick={() => {
          setMode('add');
          setContactDialogOpen(true);
          setValue(
            'contacts',
            addContact(
              {
                contact_id: '',
                name: '',
                sms: {
                  sms: false,
                  to: undefined,
                  from: undefined,
                },
                email: {
                  email: false,
                  to: undefined,
                  from: undefined,
                },
                call: {
                  call: false,

                  to: undefined,
                  from: undefined,
                },
              },
              contacts
            )
          );
          setCurrentIndex(contacts.length);
        }}
        sx={{ml: 'auto'}}
      >
        Tilføj ny kontakt
      </Button>
    </>
  );
};

export default AlarmContactForm;
