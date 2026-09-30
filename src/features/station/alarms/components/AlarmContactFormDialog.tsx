import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid2,
  Box,
  DialogActions,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormHelperText,
} from '@mui/material';
import React, {useState} from 'react';
import {
  AlarmContactDialogFormType,
  alarmContactDialogSchema,
  AlarmContactFormType,
  AlarmsFormValues,
} from '../schema';
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
import {Controller, useForm, useFormContext, UseFormSetValue} from 'react-hook-form';
import TooltipWrapper from '~/components/TooltipWrapper';
import {Channel, DEFAULT_WINDOW, fromDialogValues, toDialogValues} from '../helpers';

const AlarmContactTypedForm = createTypedForm<AlarmContactDialogFormType>();

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
    name: `${item.name} - ${item.email}`,
    mobile: item.mobile,
    email: item.email,
  }));

  return alarmContacts;
};

const emptyChannel = {selected: false, mode: null, from: null, to: null, disabled: false};

type ChannelRowProps = {
  channel: Channel;
  icon: React.ReactNode;
  disabled: boolean;
  disabledDescription: string;
};

const ChannelRow = ({channel, icon, disabled, disabledDescription}: ChannelRowProps) => {
  const {control, watch, setValue} = useFormContext<AlarmContactDialogFormType>();
  const {isMobile} = useBreakpoints();
  const selected = watch(`${channel}.selected`);
  const mode = watch(`${channel}.mode`);

  return (
    // Mobile: channel + switch on one line, times wrap onto their own full-width line
    <Box
      display="flex"
      flexWrap={isMobile ? 'wrap' : 'nowrap'}
      justifyContent={isMobile ? 'center' : 'flex-start'}
      alignItems="center"
      columnGap={1}
      rowGap={0.5}
      width="100%"
      py={isMobile ? 0.5 : 0}
    >
      <Box display="flex" alignItems="center" gap={1} flexShrink={0} position="relative">
        <AlarmContactTypedForm.Checkbox
          name={`${channel}.selected`}
          icon={icon}
          onChangeCallback={(value) => {
            // Ticking forces an active choice between whole day and a time window
            setValue(`${channel}.mode`, null, {shouldDirty: true});
            setValue(`${channel}.from`, value ? DEFAULT_WINDOW.from : null, {shouldDirty: true});
            setValue(`${channel}.to`, value ? DEFAULT_WINDOW.to : null, {shouldDirty: true});
          }}
          gridSizes="auto"
          disabled={disabled}
        />
        <Controller
          name={`${channel}.mode`}
          control={control}
          render={({field: {value, onChange}, fieldState: {error}}) => (
            <Box display="flex" flexDirection="column">
              <ToggleButtonGroup
                value={value}
                exclusive
                size="small"
                color="primary"
                disabled={!selected || disabled}
                onChange={(_, newValue) => {
                  if (newValue !== null) onChange(newValue);
                }}
              >
                <ToggleButton value="all_day" sx={{textTransform: 'none', whiteSpace: 'nowrap'}}>
                  Hele døgnet
                </ToggleButton>
                <ToggleButton value="window" sx={{textTransform: 'none'}}>
                  Tidsrum
                </ToggleButton>
              </ToggleButtonGroup>
              {error && (
                // Wrap within the toggle's width so the message never widens the row
                <FormHelperText error sx={{width: 0, minWidth: '100%'}}>
                  {error.message}
                </FormHelperText>
              )}
            </Box>
          )}
        />
        {disabled && (
          // Out of the flow on mobile so the centred ticks stay aligned across rows
          <Box
            {...(isMobile && {
              position: 'absolute',
              left: '100%',
              ml: 1,
            })}
          >
            <TooltipWrapper description={disabledDescription} />
          </Box>
        )}
      </Box>
      {selected && mode === 'window' && (
        <Box display="flex" gap={1} flex={1} minWidth={isMobile ? '100%' : 0}>
          <AlarmContactTypedForm.Input
            name={`${channel}.from`}
            label="Start interval"
            type="time"
            fullWidth
            disabled={disabled}
            gridSizes={6}
          />
          <AlarmContactTypedForm.Input
            name={`${channel}.to`}
            label="Slut interval"
            type="time"
            fullWidth
            disabled={disabled}
            gridSizes={6}
          />
        </Box>
      )}
    </Box>
  );
};

const AlarmContactFormDialog = ({open, onClose, mode, values, setValues, currentIndex}: Props) => {
  const {loc_id} = useAppContext(['loc_id']);
  const [search, setSearch] = useState<string>('');
  const {data} = useSearchContact(loc_id, search, transformData);

  const currentContact = values && currentIndex !== -1 ? values[currentIndex] : undefined;
  const [mobileDisabled, setMobileDisabled] = useState<boolean | null>(
    // currentContact ? currentContact.call.disabled || currentContact.sms.disabled : false
    null
  );
  const [emailDisabled, setEmailDisabled] = useState<boolean | null>(
    // currentContact ? currentContact.email.disabled : false
    null
  );

  const alarmContactFormMethods = useForm<AlarmContactDialogFormType>({
    resolver: zodResolver(alarmContactDialogSchema),
    defaultValues: {
      contact_id: '',
      name: '',
      sms: emptyChannel,
      email: emptyChannel,
      call: emptyChannel,
    },
    values: currentContact && toDialogValues(currentContact),
    mode: 'onTouched',
  });

  const {
    watch,
    setValue,
    formState: {isSubmitted},
  } = alarmContactFormMethods;

  const handleSubmit = (dialogData: AlarmContactDialogFormType) => {
    if (!dialogData.call?.selected && !dialogData.sms?.selected && !dialogData.email?.selected) {
      return;
    }
    const data = fromDialogValues(dialogData);

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
            name: `${currentContact.name}`,
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
                const contact = data?.find((c) => c.contact_id === value.contact_id);
                if (contact) {
                  setMobileDisabled(!contact.mobile);
                  setEmailDisabled(!contact.email);
                } else {
                  setMobileDisabled(null);
                  setEmailDisabled(null);
                }
              }}
            />
            <ChannelRow
              channel="sms"
              icon={<SmsIcon color="primary" />}
              disabled={mobileDisabled === true}
              disabledDescription="Telefonnummer er ikke registreret på denne kontakt"
            />
            <ChannelRow
              channel="email"
              icon={<EmailIcon color="primary" />}
              disabled={emailDisabled === true}
              disabledDescription="Email er ikke registreret på denne kontakt"
            />
            <ChannelRow
              channel="call"
              icon={<CallIcon color="primary" />}
              disabled={mobileDisabled === true}
              disabledDescription="Telefonnummer er ikke registreret på denne kontakt"
            />
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
