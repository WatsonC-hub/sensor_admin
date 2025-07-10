import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';

import Button from '~/components/Button';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskForm, {FormValues} from '~/features/tasks/components/TaskForm';
import {useLocationData} from '~/hooks/query/useMetadata';
import {useDisplayState} from '~/hooks/ui';

interface Props {
  open: boolean;
  closeModal: () => void;
}

const CreateManuelTaskModal = ({open, closeModal}: Props) => {
  const {post: createTask} = useTasks();
  const ts_id_display = useDisplayState((state) => state.ts_id);
  const {data: metadata} = useLocationData();

  const ts_id = metadata?.timeseries.length === 1 ? metadata.timeseries[0].ts_id : ts_id_display;

  const submitTask = async (values: FormValues) => {
    if (values.ts_id === undefined) return;
    const submit = {
      ...values,
      due_date: dayjs(values.due_date).format('YYYY-MM-DD'),
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
    <Dialog open={open} onClose={closeModal} fullWidth>
      <DialogTitle>Registrer opgave</DialogTitle>
      <TaskForm
        onSubmit={submitTask}
        defaultValues={{
          ts_id: ts_id ?? undefined,
          status_id: 1,
        }}
      >
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TaskForm.SelectTimeseries label="Tidsserie" />
          <TaskForm.Input name="name" label="Opgavenavn" />
          {/* <TaskForm.Input name="status_id" label="Status" /> */}
          <TaskForm.DueDate />
          <TaskForm.AssignedTo />
          <TaskForm.StatusSelect disableClosedStatus />
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
