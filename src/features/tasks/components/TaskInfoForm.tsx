import {Box, Grid, Stack, Typography} from '@mui/material';
import React from 'react';
import {FieldValues, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskForm from '~/features/tasks/components/TaskForm';
import {Task} from '~/features/tasks/types';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type TaskInfoFormProps = {
  selectedTask: Task;
};

const TaskInfoForm = ({selectedTask}: TaskInfoFormProps) => {
  const {location, station} = useNavigationFunctions();
  const {patch} = useTasks();
  const {
    trigger,
    getValues,
    formState: {dirtyFields},
  } = useFormContext();

  const handleBlurSubmit = (values: Partial<FieldValues>) => {
    const payload = {
      path: `${selectedTask.id}`,
      data: {ts_id: selectedTask.ts_id, ...values},
    };
    patch.mutate(payload);
  };

  const onBlur = async (field_name: keyof FieldValues) => {
    const validated = await trigger(field_name);
    let field_value = getValues(field_name);

    const isDirty = dirtyFields[field_name];

    if (field_name === 'due_date' && field_value === '') field_value = null;

    if (validated && isDirty) {
      handleBlurSubmit({[field_name]: field_value});
    }
  };

  return (
    <Box display={'flex'} flexDirection={'column'} mx={2} gap={2}>
      <Stack display={'flex'} flexDirection={'row'} justifyContent={'space-evenly'}>
        <Button bttype="tertiary" onClick={() => location(selectedTask.loc_id)}>
          <Typography>Gå til lokationen</Typography>
        </Button>
        <Button bttype="tertiary" onClick={() => station(selectedTask.loc_id, selectedTask.ts_id)}>
          <Typography>Gå til tidsserien</Typography>
        </Button>
      </Stack>
      <Grid container spacing={1}>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input
            label={'Navn'}
            name="name"
            onBlurCallback={async () => await onBlur('name')}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.StatusSelect
            onBlurCallback={async () => await onBlur('status_id')}
            sx={{
              mb: 2,
            }}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.DueDate onBlurCallback={async () => await onBlur('due_date')} />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.AssignedTo
            onBlur={async () => {
              await onBlur('assigned_to');
            }}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Lokationsnavn" name="location_name" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Lokationstype" name="loctypename" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Tidsserie type" name="tstype_name" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input label="Projektnummer" name="projectno" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={12}>
          <TaskForm.Input label="Projektinfo" name="project_text" disabled />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={12}>
          <TaskForm.Input
            label="Beskrivelse"
            name="description"
            multiline={true}
            rows={5}
            placeholder="Indtæst opgavebeskrivelse..."
            onBlurCallback={async () => await onBlur('description')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskInfoForm;
