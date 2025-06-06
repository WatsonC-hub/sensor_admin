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
import {Alarm, alarmTable} from '~/types';
const alarmsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  attentionLevel: z.enum(['upperAttention', 'lowerAttention', 'upperAlarm', 'lowerAlarm'], {
    required_error: 'Attention level is required',
  }),
  criteria: z.string(),
  interval: z.number().min(1, 'Interval must be at least 1 hour'),
});

export type AlarmsFormValues = z.infer<typeof alarmsSchema>;
const Form = createTypedForm<AlarmsFormValues>();

const Alarms = () => {
  const [pageToShow] = useStationPages();
  const [showForm] = useShowFormState();
  const [open, setOpen] = React.useState(false);
  const {ts_id} = useAppContext(['ts_id']);

  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarmsSchema),
    defaultValues: {
      name: '',
      attentionLevel: 'upperAttention',
      criteria: '',
      interval: 1,
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

  const alarm: alarmTable = {
    name: alarms?.[0].name,
    // otherAlarms: alarms?.filter((alarm) => alarm.name !== alarms?.[0]?.name) || [],
    otherAlarms: alarms || [],
    alarmContacts: alarmContacts || [],
  };

  const handleSubmit = (data: AlarmsFormValues) => {
    console.log('Alarm data submitted:', data);
    // Here you would typically send the data to your API or handle it as needed
  };

  const cancel = () => {
    setOpen(false);
    alarmMethods.reset();
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      <Dialog open={open} onClose={() => alarmMethods.reset()} fullWidth maxWidth="sm">
        <DialogTitle>Alarmer</DialogTitle>
        <DialogContent>
          <Form formMethods={alarmMethods} label="Alarm">
            <Form.Input name="name" label="Alarm Name" placeholder="Enter alarm name" />
            <Form.Input select name="attentionLevel" label="Attention Level">
              <MenuItem value="upperAttention">Upper Attention</MenuItem>
              <MenuItem value="lowerAttention">Lower Attention</MenuItem>
              <MenuItem value="upperAlarm">Upper Alarm</MenuItem>
              <MenuItem value="lowerAlarm">Lower Alarm</MenuItem>
            </Form.Input>
            <Form.Input
              name="criteria"
              label="Criteria"
              placeholder="Enter criteria for the alarm"
            />
            <Form.Input
              name="interval"
              label="Interval (hours)"
              type="number"
              placeholder="Enter interval in hours"
            />
            <Box ml={'auto'} display="flex" gap={1}>
              <Form.Cancel cancel={cancel} />
              <Form.Submit submit={handleSubmit} />
            </Box>
          </Form>
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
