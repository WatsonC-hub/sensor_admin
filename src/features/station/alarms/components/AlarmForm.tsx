import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
import AlarmNotificationForm from './AlarmNotificationForm';
import {AlarmsFormValues, alarmsSchema} from '../schema';
import {Box} from '@mui/material';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlarmPost, alarmTable} from '../types';
import {useAppContext} from '~/state/contexts';
import {useAlarm} from '../api/useAlarm';
import {toast} from 'react-toastify';
import FormFieldset from '~/components/formComponents/FormFieldset';
import AlarmContactForm from './AlarmContactForm';
import AlarmContactFormDialog from './AlarmContactFormDialog';
import AlarmGroup from './AlarmGroup';

type AlarmFormProps = {
  setOpen: (open: boolean) => void;
  alarm?: alarmTable;
};

const Form = createTypedForm<AlarmsFormValues>();

const AlarmForm = ({setOpen, alarm}: AlarmFormProps) => {
  const {ts_id} = useAppContext(['ts_id']);

  const [contactsCollapsed, setContactsCollapsed] = useState(false);

  const {post: postAlarm, put: putAlarm} = useAlarm();
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('view');

  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarmsSchema),
    defaultValues: {
      name: alarm?.name || '',
      group_id: alarm?.group_id ?? '',
      notification_ids: alarm?.alarm_notifications ?? [],
      contacts: alarm?.alarm_contacts || [],
      comment: alarm?.comment || '',
    },
    values: alarm && {
      name: alarm.name,
      group_id: alarm.group_id,
      notification_ids: alarm.alarm_notifications,
      contacts: alarm.alarm_contacts,
      comment: alarm.comment,
    },
    mode: 'onTouched',
  });

  const {reset, watch, setValue} = alarmMethods;

  const contacts = watch('contacts');

  const handleSubmit = (data: AlarmsFormValues) => {
    const contacts =
      data.contacts?.map((contact) => ({
        contact_id: contact.contact_id ?? '',
        sms: contact.sms?.selected ?? false,
        sms_to: contact.sms?.selected && contact.sms?.to ? contact.sms.to : undefined,
        sms_from: contact.sms?.from && contact.sms.selected ? contact.sms.from : undefined,
        email: contact.email?.selected ?? false,
        email_to: contact.email?.selected && contact.email.to ? contact.email.to : undefined,
        email_from: contact.email?.selected && contact.email.from ? contact.email.from : undefined,
        call: contact.call?.selected ?? false,
        call_to: contact.call?.selected && contact.call?.to ? contact.call.to : undefined,
        call_from: contact.call?.selected && contact.call?.from ? contact.call.from : undefined,
      })) ?? [];

    if (alarm === undefined) {
      const alarm_data: AlarmPost = {
        name: data.name,
        comment: data.comment,
        group_id: data.group_id,
        alarm_contacts: contacts,
        notification_ids: data.notification_ids,
      };

      const payload = {
        path: `${ts_id}`,
        data: alarm_data,
      };
      postAlarm(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
          toast.success('Alarm oprettet');
        },
      });
    } else {
      const alarm_data: AlarmPost = {
        name: data.name,
        comment: data.comment,
        group_id: data.group_id,
        alarm_contacts: contacts,
        notification_ids: data.notification_ids,
      };

      const payload = {
        path: `${alarm.id}`,
        data: alarm_data,
      };
      putAlarm(payload, {
        onSuccess: () => {
          setOpen(false);
          reset();
          toast.success('Alarm opdateret');
        },
      });
    }
  };

  return (
    <>
      <Form formMethods={alarmMethods}>
        <Form.Input
          name="name"
          label="Alarm navn"
          placeholder="Indtast alarm navn"
          gridSizes={{xs: 12}}
        />
        <AlarmGroup />
        <AlarmNotificationForm />

        <FormFieldset
          label="Kontakter"
          sx={{width: '100%', px: 1}}
          icon={contactsCollapsed ? <ExpandMore /> : <ExpandLess />}
          onClick={() => setContactsCollapsed(!contactsCollapsed)}
        >
          {!contactsCollapsed && (
            <AlarmContactForm
              setContactDialogOpen={setContactDialogOpen}
              setMode={setMode}
              setCurrentIndex={setCurrentIndex}
            />
          )}
        </FormFieldset>
        <Form.Input
          name="comment"
          label="Kommentar"
          multiline
          rows={3}
          placeholder="f.eks. bruger kontaktes hurtigst muligt..."
          gridSizes={{xs: 12}}
        />
        <Box ml={'auto'} display="flex" gap={1}>
          <Form.Cancel
            cancel={() => {
              setOpen(false);
            }}
          />
          <Form.Submit submit={handleSubmit} />
        </Box>
      </Form>
      <AlarmContactFormDialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        mode={mode}
        setMode={setMode}
        values={contacts}
        setValues={setValue}
        currentIndex={currentIndex}
      />
    </>
  );
};

export default AlarmForm;
