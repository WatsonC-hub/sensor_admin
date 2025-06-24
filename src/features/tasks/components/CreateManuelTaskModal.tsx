import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskForm, {FormValues} from '~/features/tasks/components/TaskForm';

interface Props {
  open: boolean;
  closeModal: () => void;
}

const CreateManuelTaskModal = ({open, closeModal}: Props) => {
  const {post: createTask} = useTasks();

  const submitTask = async (values: FormValues) => {
    if (values.ts_id === undefined) return;
    const submit = {
      ...values,
      name: values.name!,
      block_on_location:
        values.block_on_location === undefined
          ? values.block_on_location
          : values.block_on_location === 'false'
            ? false
            : true,
      block_all:
        values.block_all === undefined
          ? values.block_all
          : values.block_all === 'false'
            ? false
            : true,
      ts_id: values.ts_id,
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
          <TaskForm.SelectTimeseries label="Tidsserie" />
          <TaskForm.Input name="name" label="Navn" />
          {/* <TaskForm.Input name="status_id" label="Status" /> */}
          <TaskForm.DueDate />
          <TaskForm.AssignedTo />
          <TaskForm.StatusSelect />
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
