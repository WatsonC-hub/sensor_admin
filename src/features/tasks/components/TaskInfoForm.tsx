import {Box, Grid} from '@mui/material';
import React, {useEffect} from 'react';
import {FieldValues, SubmitHandler, useFormContext} from 'react-hook-form';

import {useTasks} from '../api/useTasks';
import {Task} from '../types';

import TaskForm from './TaskForm';

type TaskInfoFormProps = {
  selectedTask: Task;
};

const TaskInfoForm = ({selectedTask}: TaskInfoFormProps) => {
  const {patch} = useTasks();
  const {handleSubmit, reset} = useFormContext();

  const handleBlurSubmit: SubmitHandler<FieldValues> = (values) => {
    const payload = {
      path: `${selectedTask.id}`,
      data: values,
    };
    patch.mutate(payload);
  };

  useEffect(() => {
    reset(selectedTask);
  }, [selectedTask]);

  return (
    <Box display={'flex'} flexDirection={'column'} mx={2} gap={2}>
      <Grid container spacing={1}>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input
            label={'Navn'}
            name="name"
            onBlurCallback={handleSubmit(handleBlurSubmit, (e) => console.log(e))}
            required
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.StatusSelect
            name="status_id"
            label="Status"
            placeholder="Vælg status..."
            required
            fullWidth
            onBlurCallback={handleSubmit(handleBlurSubmit, (e) => console.log(e))}
            sx={{
              mb: 2,
            }}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input
            label={'dato'}
            name="due_date"
            type="datetime-local"
            placeholder="Sæt forfaldsdato"
            onBlurCallback={handleSubmit(handleBlurSubmit, (e) => console.log(e))}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input
            label="Tildelt til"
            name="assigned_to"
            onBlurCallback={handleSubmit(handleBlurSubmit, (e) => console.log(e))}
          />
        </Grid>
        <Grid item mobile={12} tablet={12} laptop={6}>
          <TaskForm.Input
            label="Beskrivelse"
            name="description"
            placeholder="Indtæst opgavebeskrivelse..."
            onBlur={handleSubmit(handleBlurSubmit, (e) => console.log(e))}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskInfoForm;
