import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid2,
  Box,
  DialogActions,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import {AlarmContactFormType, alarmContactSchema, AlarmsFormValues} from '../schema';
import {createTypedForm} from '~/components/formComponents/Form';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlarmContactTypeDialog} from '../types';
import {useSearchContact} from '~/features/stamdata/api/useContactInfo';
import {useAppContext} from '~/state/contexts';
import {ContactInfo} from '~/types';
import useBreakpoints from '~/hooks/useBreakpoints';
import SmsIcon from '@mui/icons-material/Sms';
import EmailIcon from '@mui/icons-material/Email';
import CallIcon from '@mui/icons-material/Call';
import {useForm, UseFormSetValue} from 'react-hook-form';

const AlarmContactTypedForm = createTypedForm<AlarmContactFormType>();

type Props = {
  open: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  setMode: (mode: 'add' | 'edit' | 'view') => void;
  values: AlarmContactFormType[] | undefined;
  setValues: UseFormSetValue<AlarmsFormValues>;
  currentIndex: number;
};

const transformData = (data: ContactInfo[]) => {
  const alarmContacts = data.map((item) => ({
    contact_id: item.id,
    name: item.name,
  }));

  return alarmContacts;
};

const AlarmContactFormDialog = ({open, onClose, mode, values, setValues, currentIndex}: Props) => {
  const {loc_id} = useAppContext(['loc_id']);
  const [search, setSearch] = useState<string>('');
  const {data} = useSearchContact(loc_id, search, transformData);
  const {isMobile} = useBreakpoints();

  const currentContact = values && currentIndex !== -1 ? values[currentIndex] : undefined;

  const alarmContactFormMethods = useForm<AlarmContactFormType>({
    resolver: zodResolver(alarmContactSchema),
    defaultValues: {
      contact_id: '',
      name: '',
      sms: {
        selected: false,
        from: '08:00',
        to: '16:00',
      },
      email: {
        selected: false,
        from: '08:00',
        to: '16:00',
      },
      call: {
        selected: false,
        from: '08:00',
        to: '16:00',
      },
    },
    values: currentContact,
    mode: 'onTouched',
  });

  const {
    watch,
    setValue,
    trigger,
    formState: {isSubmitted},
  } = alarmContactFormMethods;

  const handleSubmit = (data: AlarmContactFormType) => {
    if (!data.call?.selected && !data.sms?.selected && !data.email?.selected) {
      return;
    }

    if (currentIndex !== -1) {
      setValues(
        'contacts',
        [...(values || []).slice(0, currentIndex), data, ...(values || []).slice(currentIndex + 1)],
        {shouldDirty: true}
      );
    } else {
      setValues('contacts', [...(values || []), data], {shouldDirty: true});
    }

    onClose();
    setSearch('');
    setValue('contact_id', '', {shouldDirty: true});
  };

  const smsSelected = watch('sms.selected');
  const emailSelected = watch('email.selected');
  const callSelected = watch('call.selected');

  const options = [
    ...(data?.filter((item) => item.contact_id !== currentContact?.contact_id) ?? []),
    ...(currentContact
      ? [
          {
            contact_id: currentContact.contact_id,
            name: currentContact.name,
          },
        ]
      : []),
  ];

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        setSearch('');
      }}
      fullWidth
    >
      <AlarmContactTypedForm useGrid={false} formMethods={alarmContactFormMethods}>
        <DialogTitle>{mode === 'add' ? 'Tilføj kontakt' : 'Rediger kontakt'}</DialogTitle>
        <DialogContent sx={{width: '100%'}}>
          <Grid2
            container
            size={{xs: 12, sm: 12}}
            width={'100%'}
            direction={'row'}
            alignItems="center"
            spacing={1}
          >
            <AlarmContactTypedForm.Autocomplete<AlarmContactTypeDialog, false>
              options={options}
              valueKey="contact_id"
              labelKey="name"
              name={'contact_id'}
              gridSizes={{xs: 12, sm: 12}}
              textFieldsProps={{
                label: 'Kontakt',
                placeholder: 'Søg og vælg kontakt...',
                required: true,
              }}
              sx={{
                pb: 0.5,
              }}
              inputValue={search}
              onInputChange={(event, value) => {
                setSearch(value);
              }}
              onChangeCallback={(value) => {
                setValue('name', value?.name ?? '', {shouldDirty: true});
              }}
            />
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={'center'}
              justifyContent={'center'}
              gap={1}
              width="100%"
            >
              <AlarmContactTypedForm.Checkbox
                name={`sms.selected`}
                icon={<SmsIcon color="primary" />}
                onChangeCallback={(value) => {
                  if (!value) {
                    setValue(`sms.from`, null, {shouldDirty: true, shouldValidate: true});
                    setValue(`sms.to`, null, {shouldDirty: true, shouldValidate: true});
                  }
                }}
                gridSizes={{sm: 1.5}}
              />
              <Box display={'flex'} flexDirection={'row'} gap={1} width="100%">
                <AlarmContactTypedForm.Input
                  name={`sms.from`}
                  label="Start interval"
                  type="time"
                  fullWidth
                  disabled={!smsSelected}
                  gridSizes={6}
                />
                <AlarmContactTypedForm.Input
                  name={`sms.to`}
                  label="Slut interval"
                  type="time"
                  fullWidth
                  disabled={!smsSelected}
                  gridSizes={6}
                />
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={'center'}
              justifyContent={'center'}
              gap={1}
              width="100%"
            >
              <AlarmContactTypedForm.Checkbox
                name={`email.selected`}
                icon={<EmailIcon color="primary" />}
                onChangeCallback={(value) => {
                  if (!value) {
                    setValue(`email.from`, '', {shouldDirty: true});
                    setValue(`email.to`, '', {shouldDirty: true});
                    trigger(`email.from`);
                    trigger(`email.to`);
                    // reset(getValues());
                  }
                }}
                gridSizes={{sm: 1.5}}
              />
              <Box display={'flex'} flexDirection={'row'} gap={1} width="100%">
                <AlarmContactTypedForm.Input
                  name={`email.from`}
                  label="Start interval"
                  type="time"
                  fullWidth
                  disabled={!emailSelected}
                  gridSizes={6}
                />
                <AlarmContactTypedForm.Input
                  name={`email.to`}
                  label="Slut interval"
                  type="time"
                  fullWidth
                  disabled={!emailSelected}
                  gridSizes={6}
                />
              </Box>
            </Box>
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={'center'}
              justifyContent={'center'}
              gap={1}
              width="100%"
            >
              <AlarmContactTypedForm.Checkbox
                name={`call.selected`}
                icon={<CallIcon color="primary" />}
                onChangeCallback={(value) => {
                  if (!value) {
                    setValue(`call.from`, '', {shouldDirty: true});
                    setValue(`call.to`, '', {shouldDirty: true});
                    trigger(`call.from`);
                    trigger(`call.to`);
                  }
                }}
                gridSizes={{sm: 1.5}}
              />
              <Box display={'flex'} flexDirection={'row'} gap={1} width="100%">
                <AlarmContactTypedForm.Input
                  name={`call.from`}
                  label="Start interval"
                  type="time"
                  fullWidth
                  disabled={!callSelected}
                  gridSizes={6}
                />
                <AlarmContactTypedForm.Input
                  name={`call.to`}
                  label="Slut interval"
                  type="time"
                  fullWidth
                  disabled={!callSelected}
                  gridSizes={6}
                />
              </Box>
            </Box>
            <Grid2 size={12} display={'flex'} flexDirection={'row'} justifyContent={'center'}>
              {!callSelected && !smsSelected && !emailSelected && isSubmitted && (
                <Typography color="error" alignSelf="center">
                  Mindst én kontaktmetode skal være valgt
                </Typography>
              )}
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <AlarmContactTypedForm.Cancel
            cancel={() => {
              onClose();
              setSearch('');
            }}
          />
          <AlarmContactTypedForm.Submit submit={handleSubmit} />
        </DialogActions>
      </AlarmContactTypedForm>
    </Dialog>
  );
};

export default AlarmContactFormDialog;
