import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import React from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput, {FormInputProps} from '~/components/FormInput';

const zodSchema = z.object({
  name: z.string(),
  description: z.string(),
  status_id: z.number(),
  due_date: z.string().nullable(),
  assigned_to: z.string(),
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

  const formMethods = useFormContext<FormValues>();

  return (
    <Button
      bttype="primary"
      onClick={formMethods.handleSubmit(onSubmit, onError)}
      startIcon={<Save />}
    >
      Gem
    </Button>
  );
};

const Input = (props: FormInputProps<FormValues>) => {
  return <FormInput {...props} />;
};

const StatusSelect = (props: FormInputProps<FormValues>) => {
  //   const formMethods = useFormContext<FormValues>();
  return <FormInput {...props} type="select" />;
};

TaskForm.SubmitButton = TaskSubmitButton;
TaskForm.Input = Input;
TaskForm.StatusSelect = StatusSelect;

export default TaskForm;
