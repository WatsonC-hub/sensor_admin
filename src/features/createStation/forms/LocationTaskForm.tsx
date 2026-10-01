import {zodResolver} from '@hookform/resolvers/zod';
import {AddCircleOutlined} from '@mui/icons-material';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, List} from '@mui/material';
import dayjs from 'dayjs';
import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import {createTypedForm} from '~/components/formComponents/Form';
import FormFieldset from '~/components/formComponents/FormFieldset';
import SimpleTextView from '~/components/SimpleTextView';
import useBreakpoints from '~/hooks/useBreakpoints';

import {button_sx} from '../commonStyle';
import {useCreateStationStore} from '../state/useCreateStationStore';

import type {LocationTaskDraft} from '../types';

const locationTaskSchema = z.object({
  name: z
    .string({message: 'Navn skal være angivet'})
    .min(5, 'Navn skal være mindst 5 tegn')
    .max(255, 'Navn må maks være 255 tegn'),
  description: z.string().nullish(),
  due_date: z
    .string()
    .nullish()
    .transform((value) => (value === '' ? null : value)),
});

type LocationTaskInput = z.input<typeof locationTaskSchema>;
type LocationTaskOutput = z.output<typeof locationTaskSchema>;

const Form = createTypedForm<LocationTaskInput, LocationTaskOutput>();

const LocationTaskForm = () => {
  const {isMobile} = useBreakpoints();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tasks, setState] = useCreateStationStore((state) => [
    state.formState.location?.tasks,
    state.setState,
  ]);

  const formMethods = useForm<LocationTaskInput, unknown, LocationTaskOutput>({
    resolver: zodResolver(locationTaskSchema),
    defaultValues: {name: '', description: null, due_date: null},
  });

  const onChange = (value: LocationTaskDraft[]) => {
    setState('location.tasks', value.length > 0 ? value : undefined);
  };

  const closeDialog = () => {
    formMethods.reset();
    setDialogOpen(false);
  };

  return (
    <FormFieldset label={'Opgaver'} sx={{p: 1, width: '100%'}}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <List disablePadding>
          {(tasks ?? []).length === 0 && <SimpleTextView primaryText={'Ingen opgaver tilføjet'} />}
          {tasks?.map((task, index) => (
            <SimpleTextView
              key={`${task.name}-${task.due_date ?? ''}-${task.description ?? ''}`}
              primaryText={task.name}
              secondaryText={
                task.due_date ? `Forfald: ${dayjs(task.due_date).format('L')}` : undefined
              }
              onRemove={() => onChange(tasks.filter((_, i) => i !== index))}
            />
          ))}
        </List>
        <Button
          bttype="primary"
          startIcon={<AddCircleOutlined />}
          sx={{
            ...button_sx(tasks !== undefined && tasks.length > 0),
            alignSelf: isMobile ? 'start' : 'flex-start',
          }}
          onClick={() => setDialogOpen(true)}
        >
          Tilføj
        </Button>
      </Box>
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth>
        <DialogTitle>Tilføj opgave til lokationen</DialogTitle>
        <Form formMethods={formMethods} gridSizes={12}>
          <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <Form.Input name="name" label="Opgavenavn" required />
            <Form.Input name="due_date" label="Forfaldsdato" type="date" />
            <Form.Input name="description" label="Beskrivelse" multiline rows={4} />
          </DialogContent>
          <DialogActions>
            <Form.Cancel cancel={closeDialog} />
            <Form.Submit
              submit={(values) => {
                onChange([...(tasks ?? []), values]);
                closeDialog();
              }}
            />
          </DialogActions>
        </Form>
      </Dialog>
    </FormFieldset>
  );
};

export default LocationTaskForm;
