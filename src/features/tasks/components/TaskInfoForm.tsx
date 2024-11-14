import {Box, Grid} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {FieldValues, useFormContext} from 'react-hook-form';

import {useTasks} from '../api/useTasks';
import {Task} from '../types';

import TaskForm from './TaskForm';

type TaskInfoFormProps = {
  selectedTask: Task;
};

const TaskInfoForm = ({selectedTask}: TaskInfoFormProps) => {
  const {patch} = useTasks();
  const {
    trigger,
    getValues,
    formState: {dirtyFields},
    resetField,
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
    const field_value = getValues(field_name);

    const isDirty = dirtyFields[field_name];

    if (validated && isDirty) {
      handleBlurSubmit({[field_name]: field_value});
      resetField(field_name, {
        defaultValue: field_value,
      });
    }
  };

  return (
    <Box display={'flex'} flexDirection={'column'} mx={2} gap={2}>
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
            name="status_id"
            label="Status"
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
