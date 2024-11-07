import {Box, Grid, MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import FormInput from '~/components/FormInput';
import {APIError} from '~/queryClient';

import {Task, TaskStatus} from '../types';

const taskSchema = z.object({
  id: z.string().optional(),
  ts_id: z.number(),
  name: z.string({required_error: 'Navn på opgaven skal være udfyldt'}),
  status_id: z.number(),
  status_name: z.string(),
  due_date: z.string(),
  assigned_to: z.string().length(3, 'initialer skal indeholde 3 bogstaver').nullish(),
  created_last_name: z.string().nullish(),
});

type InferTask = z.infer<typeof taskSchema>;

type TaskInfoFormProps = {
  selectedTask: Task;
};

const TaskInfoForm = ({selectedTask}: TaskInfoFormProps) => {
  const {data: task_status} = useQuery<TaskStatus[], APIError>({
    queryKey: ['task_status'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/status');

      return data;
    },
  });
  console.log(selectedTask);
  const schemaData = taskSchema.safeParse(selectedTask);

  console.log(schemaData);

  const formMethods = useForm<InferTask>({
    defaultValues: schemaData.success ? schemaData.data : {},
    mode: 'onTouched',
  });

  const {reset} = formMethods;

  useEffect(() => {
    if (selectedTask) {
      if (schemaData.success) reset(schemaData.data);
    }
  }, [selectedTask]);

  if (!task_status) return <div></div>;

  return (
    <FormProvider {...formMethods}>
      <Box display={'flex'} flexDirection={'column'} mx={2} gap={2}>
        <Grid container spacing={1}>
          <Grid item mobile={12} tablet={12} laptop={6}>
            <FormInput label={'Navn'} name="name" required />
          </Grid>
          <Grid item mobile={12} tablet={12} laptop={6}>
            <FormInput
              name="status_id"
              label="Status"
              placeholder="Vælg status..."
              select
              required
              fullWidth
              sx={{
                mb: 2,
              }}
            >
              {task_status.map((status) => {
                return (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                );
              })}
            </FormInput>
          </Grid>
          <Grid item mobile={12} tablet={12} laptop={6}>
            <FormInput
              label={'dato'}
              name="due_date"
              type="datetime-local"
              placeholder="Sæt forfaldsdato"
            />
          </Grid>
          <Grid item mobile={12} tablet={12} laptop={6}>
            <FormInput label="Tildelt til" name="assigned_to" />
          </Grid>
        </Grid>
      </Box>
    </FormProvider>
  );
};

export default TaskInfoForm;
