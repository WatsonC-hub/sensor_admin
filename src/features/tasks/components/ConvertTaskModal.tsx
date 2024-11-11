import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import {useForm, FormProvider} from 'react-hook-form';
import {z} from 'zod';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {useTasks} from '~/features/tasks/api/useTasks';
import {Notification} from '~/hooks/query/useNotificationOverview';

interface Props {
  open: boolean;
  closeModal: () => void;
  notification: Notification;
}

const zodSchema = z.object({
  name: z.string(),
  description: z.string(),
  status_id: z.number(),
  due_date: z.string().nullable(),
  assigned_to: z.string(),
});
type FormValues = z.infer<typeof zodSchema>;

const ConvertTaskModal = ({open, closeModal, notification}: Props) => {
  const {convertNotificationToTask} = useTasks();

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      name: notification.opgave ?? '',
      description: '',
      status_id: 1,
      due_date: null,
      assigned_to: '',
    },
  });

  return (
    <Dialog open={open} onClose={closeModal}>
      <DialogTitle>Lav til opgave</DialogTitle>

      <FormProvider {...formMethods}>
        <DialogContent>
          <FormInput name="name" label="Navn" />
          <FormInput name="description" label="Beskrivelse" />
          <FormInput name="status_id" label="Status" />
          <FormInput name="due_date" label="Due date" />
          <FormInput name="assigned_to" label="Tildelt til" />
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={closeModal}>
            Annuller
          </Button>
          <Button
            bttype="primary"
            onClick={formMethods.handleSubmit(async (data) => {
              const submit = {
                ...data,
                notification_id: notification.notification_id,
                ts_id: notification.ts_id,
              };
              convertNotificationToTask.mutate(submit);
            })}
            startIcon={<Save />}
          >
            Opret
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default ConvertTaskModal;
