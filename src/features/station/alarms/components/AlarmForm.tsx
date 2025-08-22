import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {createTypedForm} from '~/components/formComponents/Form';
import AlarmCriteriaForm from './AlarmCriteriaForm';
import {AlarmsFormValues, alarmsSchema} from '../schema';
import {Box, Chip, Tooltip, Typography} from '@mui/material';
import AlarmContactTypedForm from './AlarmContactForm';
import {ExpandLess, ExpandMore} from '@mui/icons-material';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlarmPost, alarmTable} from '../types';
import {useAppContext} from '~/state/contexts';
import {useAlarm} from '../api/useAlarm';
import {toast} from 'react-toastify';
import FormFieldset from '~/components/formComponents/FormFieldset';
import {useLocationData} from '~/hooks/query/useMetadata';
import {Group} from '~/types';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {useQuery} from '@tanstack/react-query';

type AlarmFormProps = {
  setOpen: (open: boolean) => void;
  alarm?: alarmTable;
};

const Form = createTypedForm<AlarmsFormValues>();

const AlarmForm = ({setOpen, alarm}: AlarmFormProps) => {
  const {ts_id, loc_id} = useAppContext(['ts_id', 'loc_id']);
  const [contactsCollapsed, setContactsCollapsed] = useState(false);
  const {data: location_data} = useLocationData(loc_id);
  const {post: postAlarm, put: putAlarm} = useAlarm();

  const {data: options} = useQuery({
    queryKey: queryKeys.Groups.all(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Group>>('/sensor_field/stamdata/location_groups');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarmsSchema),
    defaultValues: {
      name: alarm?.name || '',
      groups: alarm?.groups || [],
      criteria: alarm?.alarm_notifications ?? [],
      contacts: alarm?.alarm_contacts || [],
      comment: alarm?.note_to_include || '',
    },
    mode: 'onTouched',
  });

  const {reset} = alarmMethods;

  const handleSubmit = (data: AlarmsFormValues) => {
    if (alarm === undefined) {
      const alarm_data: AlarmPost = {
        name: data.name,
        note_to_include: data.comment,
        groups: data.groups.map((group) => group.id),
        alarm_contacts:
          data.contacts?.map((contact) => ({
            contact_id: contact.contact_id ?? '',
            sms: contact.sms?.sms ?? false,
            sms_to: contact.sms?.to ?? undefined,
            sms_from: contact.sms?.from ?? undefined,
            email: contact.email?.email ?? false,
            email_to: contact.email?.to ?? undefined,
            email_from: contact.email?.from ?? undefined,
            call: contact.call?.call ?? false,
            call_to: contact.call?.to ?? undefined,
            call_from: contact.call?.from ?? undefined,
          })) ?? [],
        notification_ids: data.criteria,
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
        note_to_include: data.comment,
        groups: data.groups.map((group) => group.id),
        alarm_contacts:
          data.contacts?.map((contact) => ({
            contact_id: contact.contact_id ?? '',
            sms: contact.sms?.sms ?? false,
            sms_to: contact.sms?.to ?? undefined,
            sms_from: contact.sms?.from ?? undefined,
            email: contact.email?.email ?? false,
            email_to: contact.email?.to ?? undefined,
            email_from: contact.email?.from ?? undefined,
            call: contact.call?.call ?? false,
            call_to: contact.call?.to ?? undefined,
            call_from: contact.call?.from ?? undefined,
          })) ?? [],
        notification_ids: data.criteria,
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

  return (
    <Form formMethods={alarmMethods}>
      <Form.Input
        name="name"
        label="Alarm navn"
        placeholder="Indtast alarm navn"
        gridSizes={{xs: 12}}
      />
      <Tooltip
        title={location_data?.groups ? '' : 'Ingen grupper tilgængelige på lokationen'}
        arrow
      >
        <Form.Autocomplete<Group, true>
          labelKey="group_name"
          disabled={
            location_data === undefined ||
            location_data.groups == undefined ||
            location_data.groups.length === 0
          }
          name="groups"
          options={
            options?.filter((group) =>
              location_data?.groups?.map((g) => g.id).includes(group.id)
            ) ?? []
          }
          multiple={true}
          label={'Lokationsgrupper'}
          fullWidth
          gridSizes={12}
          onSelectChange={(option) => {
            return option;
          }}
          textFieldsProps={{
            label: 'Lokationsgrupper',
            placeholder: 'Vælg grupper, som alarmen skal gælde for...',
          }}
          renderTags={(value, getTagProps) => {
            return value.map((option, index) => {
              const content = (
                <Typography display="inline" variant="body2">
                  {option.group_name}
                </Typography>
              );

              return (
                <Chip
                  {...getTagProps({index})}
                  variant="outlined"
                  label={content}
                  component={'div'}
                  key={index}
                />
              );
            });
          }}
          filterSelectedOptions
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
        />
      </Tooltip>

      <AlarmCriteriaForm />

      <FormFieldset
        label="Kontakter"
        sx={{width: '100%', px: 1}}
        icon={contactsCollapsed ? <ExpandMore /> : <ExpandLess />}
        onClick={() => setContactsCollapsed(!contactsCollapsed)}
      >
        {!contactsCollapsed && <AlarmContactTypedForm />}
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
  );
};

export default AlarmForm;
