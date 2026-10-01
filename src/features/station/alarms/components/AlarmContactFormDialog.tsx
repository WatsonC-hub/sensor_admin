import {zodResolver} from '@hookform/resolvers/zod';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import {
  Box,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import {useForm, useWatch} from 'react-hook-form';
import {useFormContext} from 'react-hook-form';

import {createTypedForm} from '~/components/formComponents/Form';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useSearchContact} from '~/features/stamdata/api/useContactInfo';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';

import {type Channel, DEFAULT_WINDOW, fromDialogValues, toDialogValues} from '../helpers';
import {alarmContactDialogSchema} from '../schema';

import type {
  AlarmContactDialogFormInput,
  AlarmContactDialogFormOutput,
  AlarmContactFormInput,
  AlarmFormInput,
} from '../schema';
import type {AlarmContactTypeDialog} from '../types';
import type {UseFormSetValue} from 'react-hook-form';
import type {ContactInfo} from '~/types';

const AlarmContactTypedForm = createTypedForm<
  AlarmContactDialogFormInput,
  AlarmContactDialogFormOutput
>();

type Props = {
  open: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  setMode: (mode: 'add' | 'edit' | 'view') => void;
  values: AlarmContactFormInput[] | undefined;
  setValues: UseFormSetValue<AlarmFormInput>;
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
  const {watch, setValue} = useFormContext<AlarmContactDialogFormInput>();
  const {isMobile} = useBreakpoints();
  const selected = watch(`${channel}.selected`);
  const mode = watch(`${channel}.mode`);
  const showTimes = !!selected && mode === 'window';

  const timeInputs = (
    <>
      <AlarmContactTypedForm.Input
        name={`${channel}.from`}
        label="Start interval"
        type="time"
        fullWidth
        disabled={disabled}
        gridSizes={6}
        size="small"
      />
      <AlarmContactTypedForm.Input
        name={`${channel}.to`}
        label="Slut interval"
        type="time"
        fullWidth
        disabled={disabled}
        gridSizes={6}
        size="small"
      />
    </>
  );

  return (
    // Mobile: channel + switch on one line, times wrap onto their own full-width line
    <Box
      sx={{
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        justifyContent: isMobile ? 'center' : 'flex-start',
        alignItems: 'center',
        columnGap: 1,
        rowGap: 0.5,
        width: '100%',
        py: isMobile ? 0.5 : 0,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative'}}>
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
        <AlarmContactTypedForm.ToggleButton
          name={`${channel}.mode`}
          useGrid={false}
          size="small"
          toggleButtonProps={{size: 'small', sx: {px: 1, py: 0.25}}}
          disabled={!selected || disabled}
          options={[
            {value: 'all_day', label: 'Hele døgnet'},
            {value: 'window', label: 'Tidsrum'},
          ]}
        />
        {disabled && (
          // Out of the flow on mobile so the centred ticks stay aligned across rows
          <Box
            sx={{
              display: 'flex',
              ...(isMobile && {position: 'absolute', left: '100%', ml: 1}),
            }}
          >
            <TooltipWrapper description={disabledDescription} />
          </Box>
        )}
      </Box>
      {isMobile ? (
        // Own line on mobile - slide it open instead of making the dialog jump
        <Collapse in={showTimes} sx={{width: '100%'}} unmountOnExit>
          <Box sx={{display: 'flex', gap: 1, pt: 0.5}}>{timeInputs}</Box>
        </Collapse>
      ) : (
        // Same line on desktop - always reserve the space so the row never changes size
        <Box
          aria-hidden={!showTimes}
          sx={{
            display: 'flex',
            gap: 1,
            flex: 1,
            minWidth: 0,
            visibility: showTimes ? 'visible' : 'hidden',
          }}
        >
          {timeInputs}
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

  const alarmContactFormMethods = useForm<
    AlarmContactDialogFormInput,
    unknown,
    AlarmContactDialogFormOutput
  >({
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
    setValue,
    control,
    formState: {isSubmitted},
  } = alarmContactFormMethods;

  const handleSubmit = (dialogData: AlarmContactDialogFormOutput) => {
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

  const smsSelected = useWatch({name: 'sms.selected', control});
  const emailSelected = useWatch({name: 'email.selected', control});
  const callSelected = useWatch({name: 'call.selected', control});

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
          <Grid
            container
            size={{xs: 12, sm: 12}}
            direction={'row'}
            spacing={1}
            sx={{
              width: '100%',
              alignItems: 'center',
            }}
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
                const contact = data?.find((c) => c.contact_id === value?.contact_id);
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
            <Grid size={12} sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              {!callSelected && !smsSelected && !emailSelected && isSubmitted && (
                <Typography
                  color="error"
                  sx={{
                    alignSelf: 'center',
                  }}
                >
                  Mindst én kontaktmetode skal være valgt
                </Typography>
              )}
            </Grid>
          </Grid>
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
