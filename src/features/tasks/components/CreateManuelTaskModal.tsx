import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import {useTasks} from '~/features/tasks/api/useTasks';

import TaskForm, {FormValues} from './TaskForm';

interface Props {
  open: boolean;
  closeModal: () => void;
}

const CreateManuelTaskModal = ({open, closeModal}: Props) => {
  const params = useParams();

  const {post: createTask} = useTasks();

  const submitTask = async (values: FormValues) => {
    if (params.ts_id === undefined) return;
    const submit = {
      ...values,
      name: values.name!,
      ts_id: parseInt(params.ts_id),
    };
    createTask.mutate(submit);
    closeModal();
  };

  return (
    <Dialog open={open} onClose={closeModal}>
      <DialogTitle>Registrer opgave</DialogTitle>
      <TaskForm onSubmit={submitTask} defaultValues={{}}>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 400,
          }}
        >
          <TaskForm.Input name="name" label="Navn" />
          {/* <TaskForm.Input name="status_id" label="Status" /> */}
          <TaskForm.DueDate />
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

export default CreateManuelTaskModal;
