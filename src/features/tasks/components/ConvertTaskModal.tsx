import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskForm, {FormValues} from '~/features/tasks/components/TaskForm';
import {Notification} from '~/hooks/query/useNotificationOverview';

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
      block_on_location:
        data.block_on_location === undefined
          ? data.block_on_location
          : data.block_on_location === 'false'
            ? false
            : true,
      block_all:
        data.block_all === undefined ? data.block_all : data.block_all === 'false' ? false : true,
      notification_id: notification.notification_id,
      ts_id: notification.ts_id,
      name: data.name!,
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
          blocks_notifications: [notification.notification_id],
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
          <TaskForm.DueDate />
          <TaskForm.AssignedTo />
          <TaskForm.Input name="description" label="Beskrivelse" multiline rows={5} />
          <TaskForm.BlockAll />
          <TaskForm.BlockOnLocation />
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
