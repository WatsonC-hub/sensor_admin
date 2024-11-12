import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {MenuItem} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {z} from 'zod';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {APIError} from '~/queryClient';

import {TaskStatus} from '../types';

const zodSchema = z.object({
  name: z.string(),
  ts_id: z.number(),
  description: z.string(),
  status_id: z.number(),
  due_date: z.string().nullable(),
  assigned_to: z.string(),
});

export type FormValues = z.infer<typeof zodSchema>;

type Props = {
  onSubmit?: (data: FormValues) => void;
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

  if (!onSubmit) return;

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

  //   const status_id = watch('status_id');

  //   useEffect(() => {
  //     if (task_status)
  //       setValue('status_id', task_status.find((status) => status.id === status_id)?.name ?? '');
  //   });

  if (!task_status) return <div></div>;

  return (
    <FormInput {...props} type="select" select>
      {task_status.map((status) => {
        return (
          <MenuItem key={status.id} value={status.id}>
            {status.name}
          </MenuItem>
        );
      })}
    </FormInput>
  );
};

TaskForm.SubmitButton = TaskSubmitButton;
TaskForm.Input = Input;
TaskForm.StatusSelect = StatusSelect;

export default TaskForm;
