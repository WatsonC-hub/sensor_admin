import React from 'react';
import {useFieldArray, useForm} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
import AlarmCriteriaForm from './AlarmCriteriaForm';
import {AlarmsFormValues, alarmsSchema} from '../schema';
import {Box} from '@mui/material';
import AlarmContactTypedForm from './AlarmContactForm';
import {AddCircle} from '@mui/icons-material';
import Button from '~/components/Button';
import FormFieldset from '~/components/FormFieldset';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlarmPost, alarmTable} from '../types';
import {useAppContext} from '~/state/contexts';
import {useAlarm} from '../api/useAlarm';
import {toast} from 'react-toastify';

type AlarmFormProps = {
  setOpen: (open: boolean) => void;
  alarm?: alarmTable;
};

const Form = createTypedForm<AlarmsFormValues>();

const AlarmForm = ({setOpen, alarm}: AlarmFormProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarmsSchema),
    defaultValues: {
      name: alarm?.name || '',
      from: alarm?.earliest_timeofday || '',
      to: alarm?.latest_timeofday || '',
      criteria: alarm?.alarmCriteria,
      contacts: alarm?.alarmContacts || [],
      interval: alarm?.alarm_interval || undefined,
      comment: alarm?.note_to_include || '',
    },
    mode: 'onTouched',
  });

  const {control, reset} = alarmMethods;
  const {post: postAlarm, put: putAlarm} = useAlarm();

  const handleSubmit = (data: AlarmsFormValues) => {
    if (alarm === undefined) {
      const alarm_data: AlarmPost = {
        name: data.name,
        alarm_interval: data.interval,
        earliest_timeofday: data.from,
        latest_timeofday: data.to,
        alarm_high: data.criteria.find((c) => c.attention_level === 'alarm_high')?.criteria,
        alarm_low: data.criteria.find((c) => c.attention_level === 'alarm_low')?.criteria,
        attention_high: data.criteria.find((c) => c.attention_level === 'attention_high')?.criteria,
        attention_low: data.criteria.find((c) => c.attention_level === 'attention_low')?.criteria,
        note_to_include: data.comment,
        alarm_contacts: data.contacts?.map((contact) => ({
          contact_id: contact.contact_id,
          sms: contact.sms,
          email: contact.email,
          call: contact.call,
        })),
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
        alarm_interval: data.interval,
        earliest_timeofday: data.from,
        latest_timeofday: data.to,
        alarm_high: data.criteria.find((c) => c.attention_level === 'alarm_high')?.criteria,
        alarm_low: data.criteria.find((c) => c.attention_level === 'alarm_low')?.criteria,
        attention_high: data.criteria.find((c) => c.attention_level === 'attention_high')?.criteria,
        attention_low: data.criteria.find((c) => c.attention_level === 'attention_low')?.criteria,
        note_to_include: data.comment,
        alarm_contacts:
          data.contacts && data.contacts.length > 0
            ? data.contacts?.map((contact) => ({
                contact_id: contact.contact_id,
                sms: contact.sms,
                email: contact.email,
                call: contact.call,
              }))
            : undefined,
      };

      const payload = {
        path: `${alarm.gid}`,
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

  const {
    fields: contactFields,
    append: addContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: 'contacts',
  });

  const {
    fields: criteriaFields,
    append: addCriteria,
    remove: removeCriteria,
  } = useFieldArray({
    control,
    name: 'criteria',
  });

  return (
    <Form formMethods={alarmMethods} label="Alarm">
      <Form.Input name="name" label="Alarm navn" placeholder="Indtast alarm navn" />
      <Form.Input
        name="interval"
        label="Interval (timer)"
        type="number"
        placeholder="Indtast interval i timer"
      />

      <Form.Input label="Start interval" type="time" name="from" />
      <Form.Input label="Slut interval" type="time" name="to" />
      <Form.Input
        name="comment"
        label="Kommentar"
        multiline
        rows={3}
        placeholder="f.eks. bruger kontaktes hurtigst muligt..."
        gridSizes={{xs: 12}}
      />

      <FormFieldset label="Kriterier" sx={{marginTop: 1, width: '100%'}}>
        {criteriaFields.map((field, index) => (
          <AlarmCriteriaForm key={field.id} index={index} remove={removeCriteria} />
        ))}
        <Box ml={'auto'} display="flex" mt={1}>
          <Button
            bttype="primary"
            startIcon={<AddCircle />}
            disabled={criteriaFields.length === 4}
            onClick={() => {
              addCriteria({attention_level: '', criteria: undefined});
            }}
            sx={{ml: 'auto'}}
          >
            Tilføj
          </Button>
        </Box>
      </FormFieldset>

      <FormFieldset label="Kontakter" sx={{marginTop: 1, width: '100%'}}>
        {contactFields.map((field, index) => (
          <div key={field.id}>
            <AlarmContactTypedForm index={index} searchValue={field.name} remove={removeContact} />
          </div>
        ))}
        <Box ml={'auto'} display="flex" mt={1}>
          <Button
            bttype="primary"
            startIcon={<AddCircle />}
            onClick={() => {
              addContact({
                contact_id: '',
                name: '',
                sms: false,
                email: false,
                call: false,
              });
            }}
            sx={{ml: 'auto'}}
          >
            Tilføj
          </Button>
        </Box>
      </FormFieldset>
      <Box ml={'auto'} display="flex" gap={1}>
        <Form.Cancel
          cancel={() => {
            setOpen(false);
          }}
        />
        <Form.Submit submit={handleSubmit} />
      </Box>
    </Form>
  );
};

export default AlarmForm;
