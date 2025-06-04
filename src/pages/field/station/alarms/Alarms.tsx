import {zodResolver} from '@hookform/resolvers/zod';
import {Box, MenuItem} from '@mui/material';
import React from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {createTypedForm} from '~/components/formComponents/Form';
import {getContactWithRoleOptions} from '~/features/stamdata/api/useContactInfo';
import AlarmContactTable from '~/features/station/alarms/components/AlarmContactTable';
import {useAppContext} from '~/state/contexts';

const alarms = z.object({
  name: z.string().min(1, 'Name is required'),
  attentionLevel: z.enum(['upperAttention', 'lowerAttention', 'upperAlarm', 'lowerAlarm'], {
    required_error: 'Attention level is required',
  }),
  criteria: z.string(),
  interval: z.number().min(1, 'Interval must be at least 1 hour'),
});

export type AlarmsFormValues = z.infer<typeof alarms>;
const Form = createTypedForm<AlarmsFormValues>();

const Alarms = () => {
  const {loc_id} = useAppContext(['loc_id']);

  const alarmMethods = useForm<AlarmsFormValues>({
    resolver: zodResolver(alarms),
    defaultValues: {
      name: '',
      attentionLevel: 'upperAttention',
      criteria: '',
      interval: 1,
    },
  });

  const contactWithRole = getContactWithRoleOptions(loc_id, 67);
  const handleSubmit = (data: AlarmsFormValues) => {
    console.log('Alarm data submitted:', data);
    // Here you would typically send the data to your API or handle it as needed
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      <Form formMethods={alarmMethods} label="Alarms">
        <Form.Input name="name" label="Alarm Name" placeholder="Enter alarm name" />
        <Form.Input select name="attentionLevel" label="Attention Level">
          <MenuItem value="upperAttention">Upper Attention</MenuItem>
          <MenuItem value="lowerAttention">Lower Attention</MenuItem>
          <MenuItem value="upperAlarm">Upper Alarm</MenuItem>
          <MenuItem value="lowerAlarm">Lower Alarm</MenuItem>
        </Form.Input>
        <Form.Input name="criteria" label="Criteria" placeholder="Enter criteria for the alarm" />
        <Form.Input
          name="interval"
          label="Interval (hours)"
          type="number"
          placeholder="Enter interval in hours"
        />
        <Form.Submit submit={handleSubmit} />
      </Form>
      <AlarmContactTable contacts={contactWithRole} />
    </Box>
  );
};

export default Alarms;
