import React, {useState} from 'react';
import {useFieldArray, useForm} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
import AlarmCriteriaForm from './AlarmCriteriaForm';
import {AlarmsFormValues, alarmsSchema} from '../schema';
import {Box} from '@mui/material';
import AlarmContactTypedForm from './AlarmContactForm';
import {AddCircle, ExpandLess, ExpandMore} from '@mui/icons-material';
import Button from '~/components/Button';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlarmPost, alarmTable} from '../types';
import {useAppContext} from '~/state/contexts';
import {useAlarm} from '../api/useAlarm';
import {useSetAtom} from 'jotai';
import {tempHorizontalAtom} from '~/state/atoms';
import {toast} from 'react-toastify';
import FormFieldset from '~/components/formComponents/FormFieldset';

type AlarmFormProps = {
  setOpen: (open: boolean) => void;
  alarm?: alarmTable;
};

const Form = createTypedForm<AlarmsFormValues>();

const AlarmForm = ({setOpen, alarm}: AlarmFormProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const [criteriaCollapsed, setCriteriaCollapsed] = useState(false);
  const [contactsCollapsed, setContactsCollapsed] = useState(false);
  const {
    post: postAlarm,
    put: putAlarm,
    getCriteria: {data: criteria_types},
  } = useAlarm();

  const setTempLines = useSetAtom(tempHorizontalAtom);
  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarmsSchema),
    defaultValues: {
      name: alarm?.name || '',
      from: alarm?.earliest_timeofday || '',
      to: alarm?.latest_timeofday || '',
      criteria: criteria_types?.map((criteria) => {
        if (alarm?.alarmCriteria.map((c) => c.name).includes(criteria.name)) {
          return alarm.alarmCriteria.find((c) => c.name === criteria.name);
        } else {
          return {
            id: criteria.id,
            name: criteria.name,
            criteria: undefined,
            sms: false,
            email: false,
            call: false,
          };
        }
      }),
      contacts: alarm?.alarmContacts || [],
      interval: alarm?.alarm_interval || undefined,
      comment: alarm?.note_to_include || '',
      signal_warning: alarm?.signal_warning || false,
    },
    mode: 'onTouched',
  });

  const {control, reset, getValues} = alarmMethods;

  const handleSubmit = (data: AlarmsFormValues) => {
    if (alarm === undefined) {
      const alarm_data: AlarmPost = {
        name: data.name,
        alarm_interval: data.interval,
        earliest_timeofday: data.from,
        latest_timeofday: data.to,
        alarm_high: data.criteria.find((c) => c.name === 'alarm_high')?.criteria,
        alarm_low: data.criteria.find((c) => c.name === 'alarm_low')?.criteria,
        attention_high: data.criteria.find((c) => c.name === 'attention_high')?.criteria,
        attention_low: data.criteria.find((c) => c.name === 'attention_low')?.criteria,
        note_to_include: data.comment,
        signal_warning: data.signal_warning,
        alarm_contacts: data.contacts?.map((contact) => ({
          contact_id: contact.contact_id,
        })),
        alarm_criteria: data.criteria
          ?.filter((c) => c.criteria !== undefined)
          .map((criteria) => ({
            id: criteria.id,
            criteria: criteria.criteria,
            sms: criteria.sms,
            email: criteria.email,
            call: criteria.call,
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
        alarm_high: data.criteria.find((c) => c.name === 'alarm_high')?.criteria,
        alarm_low: data.criteria.find((c) => c.name === 'alarm_low')?.criteria,
        attention_high: data.criteria.find((c) => c.name === 'attention_high')?.criteria,
        attention_low: data.criteria.find((c) => c.name === 'attention_low')?.criteria,
        note_to_include: data.comment,
        signal_warning: data.signal_warning,
        alarm_contacts:
          data.contacts && data.contacts.length > 0
            ? data.contacts?.map((contact) => ({
                contact_id: contact.contact_id,
              }))
            : undefined,
        alarm_criteria: data.criteria
          ?.filter((c) => c.criteria !== undefined)
          .map((criteria) => ({
            id: criteria.id,
            criteria: criteria.criteria,
            sms: criteria.sms,
            email: criteria.email,
            call: criteria.call,
          })),
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

  const {fields: criteriaFields} = useFieldArray({
    control,
    name: 'criteria',
  });

  setTempLines(
    getValues('criteria')
      ?.filter((field) => field.criteria !== undefined && field.name)
      .map((field) => {
        return {
          level: field.criteria!,
          name: field.name!,
          line: undefined,
          mode: undefined,
        };
      })
  );

  return (
    <Form formMethods={alarmMethods} label="Alarm">
      <FormFieldset
        label="Kriterier"
        sx={{width: '100%', px: 1}}
        icon={criteriaCollapsed ? <ExpandMore /> : <ExpandLess />}
        onClick={() => setCriteriaCollapsed(!criteriaCollapsed)}
      >
        {!criteriaCollapsed && (
          <>
            {criteriaFields.map((field, index) => (
              <AlarmCriteriaForm key={field.id} index={index} />
            ))}
          </>
        )}
      </FormFieldset>

      <FormFieldset
        label="Kontakter"
        sx={{width: '100%', px: 1}}
        icon={contactsCollapsed ? <ExpandMore /> : <ExpandLess />}
        onClick={() => setContactsCollapsed(!contactsCollapsed)}
      >
        {!contactsCollapsed && (
          <>
            {contactFields.map((field, index) => (
              <div key={field.id}>
                <AlarmContactTypedForm
                  index={index}
                  searchValue={field.name}
                  remove={removeContact}
                />
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
                  });
                }}
                sx={{ml: 'auto'}}
              >
                Tilføj
              </Button>
            </Box>
          </>
        )}
      </FormFieldset>
      <Form.Input name="name" label="Alarm navn" placeholder="Indtast alarm navn" />
      <Form.Input
        name="interval"
        label="Interval (timer)"
        type="number"
        placeholder="Indtast interval i timer"
      />

      <Form.Input label="Start interval" type="time" name="from" />
      <Form.Input label="Slut interval" type="time" name="to" />
      <Form.Checkbox name="signal_warning" label="Advar ved sender ikke" />
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
  );
};

export default AlarmForm;
