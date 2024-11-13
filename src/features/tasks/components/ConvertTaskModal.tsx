import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';
import {useTasks} from '~/features/tasks/api/useTasks';
import {Notification} from '~/hooks/query/useNotificationOverview';

import TaskForm, {FormValues} from './TaskForm';

interface Props {
  open: boolean;
  closeModal: () => void;
  notification: Notification;
}

const ConvertTaskModal = ({open, closeModal, notification}: Props) => {
  const {convertNotificationToTask} = useTasks();

  const onSubmit = (data: FormValues) => {
    const submit = {
      ...data,
      notification_id: notification.notification_id,
      ts_id: notification.ts_id,
    };
    convertNotificationToTask.mutate(submit, {
      onSuccess: () => {
        closeModal();
      },
    });
  };

  return (
    <Dialog open={open} onClose={closeModal}>
      <DialogTitle>Lav til opgave</DialogTitle>

      <TaskForm
        onSubmit={onSubmit}
        defaultValues={{
          name: notification.opgave ?? '',
        }}
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 400,
          }}
        >
          <TaskForm.Input name="name" label="Navn" />
          <TaskForm.Input
            name="due_date"
            label="Due date"
            type="datetime-local"
            placeholder="Sæt forfaldsdato"
          />
          <TaskForm.AssignedTo />
          <TaskForm.Input name="description" label="Beskrivelse" multiline rows={5} />
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={closeModal}>
            Annuller
          </Button>
          <TaskForm.SubmitButton />
        </DialogActions>
      </TaskForm>
    </Dialog>
  );
};

export default ConvertTaskModal;
