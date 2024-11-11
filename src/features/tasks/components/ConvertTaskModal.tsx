import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';

import FormInput from '~/components/FormInput';
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
    convertNotificationToTask.mutate(submit);
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
        <DialogContent>
          <FormInput name="" label="Navne" />
          <TaskForm.Input name="description" label="Beskrivelse" />
          {/* <TaskForm.Input name="status_id" label="Status" /> */}
          <TaskForm.Input name="due_date" label="Due date" />
          <TaskForm.Input name="assigned_to" label="Tildelt til" />
        </DialogContent>
        <DialogActions>{/* <TaskForm.SubmitButton /> */}</DialogActions>
      </TaskForm>
    </Dialog>
  );
};

export default ConvertTaskModal;
