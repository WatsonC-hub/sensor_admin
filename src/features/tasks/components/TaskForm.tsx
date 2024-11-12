import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Box, MenuItem, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {Controller, FormProvider, useForm, useFormContext} from 'react-hook-form';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import ExtendedAutocomplete, {AutoCompleteFieldProps} from '~/components/Autocomplete';
import Button from '~/components/Button';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {APIError} from '~/queryClient';

import {TaskStatus, TaskUser} from '../types';

const zodSchema = z.object({
  name: z.string(),
  ts_id: z.number(),
  description: z.string(),
  status_id: z.number(),
  due_date: z.string().nullable(),
  assigned_to: z.string().transform((value) => (value === null ? '' : value)),
});

export type FormValues = z.infer<typeof zodSchema>;

type Props = {
  onSubmit: (data: FormValues) => void;
  onError?: () => void;
  defaultValues?: Partial<FormValues>;
  children?: React.ReactNode;
};

const TaskFormContext = React.createContext({} as Props);

const TaskForm = ({onSubmit, onError, children, defaultValues}: Props) => {
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: defaultValues,
  });
  return (
    <TaskFormContext.Provider value={{onSubmit, onError}}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </TaskFormContext.Provider>
  );
};

const TaskSubmitButton = () => {
  const {onSubmit, onError} = React.useContext(TaskFormContext);

  const {handleSubmit} = useFormContext<FormValues>();

  return (
    <Button bttype="primary" onClick={handleSubmit(onSubmit, onError)} startIcon={<Save />}>
      Gem
    </Button>
  );
};

const Input = (props: FormInputProps<FormValues>) => {
  return <FormInput {...props} />;
};

const StatusSelect = (props: FormInputProps<FormValues>) => {
  const {data: task_status} = useQuery<TaskStatus[], APIError>({
    queryKey: ['task_status'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/status');

      return data;
    },
  });

  return (
    <FormInput select placeholder="Vælg status..." fullWidth {...props}>
      {task_status?.map((status) => {
        return (
          <MenuItem key={status.id} value={status.id}>
            {status.name}
          </MenuItem>
        );
      })}
    </FormInput>
  );
};

const AssignedTo = (props: Partial<AutoCompleteFieldProps<TaskUser>>) => {
  const {data: taskUsers} = useQuery<TaskUser[], APIError>({
    queryKey: ['task_users'],
    queryFn: async () => {
      const {data} = await apiClient.get('/sensor_admin/tasks/task_users');

      return data;
    },
  });
  const {control} = useFormContext<FormValues>();
  return (
    <Controller
      name="assigned_to"
      control={control}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <ExtendedAutocomplete<TaskUser>
          {...props}
          options={taskUsers ?? []}
          labelKey="email"
          error={error?.message}
          onChange={(option) => {
            if (option == null) {
              onChange(null);
              return;
            }
            if ('id' in option) {
              onChange(option.id);
            }
          }}
          selectValue={
            taskUsers?.find((item) => item.id === value) ?? {
              id: '-1',
              email: '',
            }
          }
          filterOptions={(options, params) => {
            const {inputValue} = params;

            const filter = options.filter((option) => option.email?.includes(inputValue));

            return filter;
          }}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option.id}>
                <Box display={'flex'} flexDirection={'row'} mx={2} gap={1}>
                  <Typography variant="body2">{option.email}</Typography>
                </Box>
              </li>
            );
          }}
          textFieldsProps={{
            label: 'Tildeles til',
            placeholder: 'Vælg opgave ansvarlig',
          }}
        />
      )}
    />
  );
};

TaskForm.SubmitButton = TaskSubmitButton;
TaskForm.Input = Input;
TaskForm.StatusSelect = StatusSelect;
TaskForm.AssignedTo = AssignedTo;

export default TaskForm;
