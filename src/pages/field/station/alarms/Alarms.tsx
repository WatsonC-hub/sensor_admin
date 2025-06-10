import {zodResolver} from '@hookform/resolvers/zod';
import {Box, Dialog, DialogContent, DialogTitle, MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import FabWrapper from '~/components/FabWrapper';
import {createTypedForm} from '~/components/formComponents/Form';
import {getAlarmContacts} from '~/features/stamdata/api/useContactInfo';
import AlarmTable from '~/features/station/alarms/components/AlarmTable';
import {useAppContext} from '~/state/contexts';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import {apiClient} from '~/apiClient';
import {Alarm, AlarmContact, alarmTable} from '~/types';
const alarmsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  attentionLevel: z.enum(['upperAttention', 'lowerAttention', 'upperAlarm', 'lowerAlarm'], {
    required_error: 'Attention level is required',
  }),
  criteria: z.string(),
  interval: z.number().min(1, 'Interval must be at least 1 hour'),
});

const alarmContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sms: z.boolean(),
  email: z.boolean(),
  call: z.boolean(),
  alarm_interval: z.number().min(1, 'Alarm interval must be at least 1 hour'),
});

export type AlarmContactFormValues = z.infer<typeof alarmContactSchema>;
const AlarmContactForm = createTypedForm<AlarmContactFormValues>();

export type AlarmsFormValues = z.infer<typeof alarmsSchema>;
const AlarmForm = createTypedForm<AlarmsFormValues>();

const Alarms = () => {
  const [pageToShow] = useStationPages();
  const [showForm] = useShowFormState();
  const [open, setOpen] = React.useState(false);
  const {ts_id} = useAppContext(['ts_id']);
  const [tempAlarms, setTempAlarms] = React.useState<Array<Alarm>>([]);
  const [tempAlarmContacts, setTempAlarmContacts] = React.useState<Array<AlarmContact>>([]);

  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarmsSchema),
    defaultValues: {
      name: '',
      attentionLevel: 'upperAttention',
      criteria: '',
      interval: 1,
    },
  });

  const alarmContactMethods = useForm<AlarmContactFormValues>({
    resolver: zodResolver(alarmContactSchema),
    defaultValues: {
      name: '',
      sms: false,
      email: false,
      call: false,
      alarm_interval: 1,
    },
  });

  const {data: alarms} = useQuery({
    queryKey: ['alarm', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<Alarm>>(
        `/sensor_field/stamdata/contact/alarm/${ts_id}`
      );
      // Fetch alarm data from your API or state management
      // This is a placeholder, replace with actual API call
      return data;
    },
    enabled: !!ts_id,
  });

  const {data: alarmContacts} = useQuery(getAlarmContacts(ts_id));

  const alarm =
    alarms && alarms.length > 0
      ? {
          name: alarms?.[0]?.name,
          // otherAlarms: alarms?.filter((alarm) => alarm.name !== alarms?.[0]?.name) || [],
          otherAlarms: alarms || [],
          alarmContacts: alarmContacts || [],
        }
      : ({} as alarmTable);

  const handleSubmit = (data: AlarmsFormValues) => {
    console.log('Alarm data submitted:', data);
    // Here you would typically send the data to your API or handle it as needed
  };

  const pushAlarm = (data: AlarmsFormValues) => {
    setTempAlarms((prev) => [
      ...prev,
      {name: data.name, criteria: data.criteria, alarm_interval: data.interval},
    ]);
  };

  const cancel = () => {
    setOpen(false);
    alarmMethods.reset();
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      <Dialog open={open} onClose={cancel} fullWidth maxWidth="sm">
        <DialogTitle>Alarmer</DialogTitle>
        <DialogContent>
          <AlarmForm formMethods={alarmMethods} label="Alarm">
            <AlarmForm.Input name="name" label="Alarm Name" placeholder="Enter alarm name" />
            <AlarmForm.Input select name="attentionLevel" label="Attention Level">
              <MenuItem value="upperAttention">Upper Attention</MenuItem>
              <MenuItem value="lowerAttention">Lower Attention</MenuItem>
              <MenuItem value="upperAlarm">Upper Alarm</MenuItem>
              <MenuItem value="lowerAlarm">Lower Alarm</MenuItem>
            </AlarmForm.Input>
            <AlarmForm.Input
              name="criteria"
              label="Criteria"
              placeholder="Enter criteria for the alarm"
            />
            <AlarmForm.Input
              name="interval"
              label="Interval (hours)"
              type="number"
              placeholder="Enter interval in hours"
            />
            <Box ml={'auto'} display="flex" gap={1}>
              <AlarmForm.Cancel cancel={cancel} />
              <AlarmForm.Submit submit={pushAlarm} />
            </Box>
          </AlarmForm>
          <AlarmContactForm formMethods={alarmContactMethods} label="Alarm Contact">
            {/* Lav laves om til et select med alarm kontakter som options */}
            <AlarmContactForm.Input
              name="name"
              label="Contact Name"
              placeholder="Enter contact name"
            />
            <AlarmContactForm.Input
              name="alarm_interval"
              label="Alarm Interval (hours)"
              type="number"
              placeholder="Enter interval in hours"
            />
            <AlarmContactForm.Checkbox name="sms" label="SMS" gridSizes={{xs: 12, sm: 2}} />
            <AlarmContactForm.Checkbox name="email" label="Email" gridSizes={{xs: 12, sm: 2}} />
            <AlarmContactForm.Checkbox name="call" label="Call" gridSizes={{xs: 12, sm: 2}} />
            <Box ml={'auto'} display="flex" gap={1}>
              <AlarmContactForm.Cancel cancel={cancel} />
              <AlarmContactForm.Submit
                submit={(data) => {
                  setTempAlarmContacts((prev) => [
                    ...prev,
                    {
                      name: data.name,
                      sms: data.sms,
                      email: data.email,
                      call: data.call,
                      alarm_interval: data.alarm_interval,
                    },
                  ]);
                }}
              />
            </Box>
          </AlarmContactForm>
        </DialogContent>
      </Dialog>
      <AlarmTable alarm={alarm} />
      <FabWrapper
        icon={<MoreTimeIcon />}
        text="Tilføj Alarm"
        onClick={() => setOpen(true)}
        // disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
        sx={{
          visibility: pageToShow === 'alarm' && showForm === null ? 'visible' : 'hidden',
        }}
      />
    </Box>
  );
};

export default Alarms;
