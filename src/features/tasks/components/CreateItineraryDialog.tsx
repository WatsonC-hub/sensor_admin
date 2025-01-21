import {Dialog, DialogTitle, DialogContent, Box, DialogActions} from '@mui/material';
import React, {useState} from 'react';

import Button from '~/components/Button';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';

import {useTaskItinerary} from '../api/useTaskItinerary';
import {useTaskStore} from '../api/useTaskStore';
import {ID} from '../types';

import TaskForm, {FormValues} from './TaskForm';

type CreateItineraryDialogProps = {
  ids: ID[];
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
};

const CreateItineraryDialog = ({ids, dialogOpen, setDialogOpen}: CreateItineraryDialogProps) => {
  const {tasks} = useTaskStore();
  const [{state}] = useStatefullTableAtom('taskTableState');
  const {post} = useTaskItinerary();
  const [taskIds] = useState(Object.keys(state?.rowSelection ? state?.rowSelection : []));
  const [selectedTasks] = useState(
    tasks?.filter((task) => taskIds.includes(task.id) || ids.includes(task.id))
  );

  const onClose = () => {
    setDialogOpen(false);
  };

  console.log(selectedTasks);
  const onSubmit = (data: FormValues) => {
    if (selectedTasks) {
      //   const lowestDate = selectedTasks.reduce((acc, curr) => {
      //     if (!curr.due_date) return acc;
      //     if (!acc) return curr.due_date;

      //     return acc < curr.due_date ? acc : curr.due_date;
      //   }, selectedTasks[0].due_date);

      //   // find assigned to if it is the same for all tasks
      //   const assigned_to = selectedTasks.reduce((acc, curr) => {
      //     if (!acc) return curr.assigned_to;
      //     if (acc !== curr.assigned_to) return '';
      //     return acc;
      //   }, selectedTasks[0].assigned_to);

      post.mutate({
        task_ids: [...new Set([...taskIds, ...ids])],
        due_date: data.due_date,
        assigned_to: data.assigned_to,
      });
    }
  };
  return (
    <Dialog open={dialogOpen} onClose={onClose}>
      <DialogTitle>Masse opdatere opgaver</DialogTitle>

      <TaskForm
        onSubmit={onSubmit}
        defaultValues={{
          assigned_to:
            selectedTasks && selectedTasks.length > 0
              ? selectedTasks?.reduce((acc, curr) => {
                  if (!acc) return curr.assigned_to;
                  if (acc !== curr.assigned_to) return '';
                  return acc;
                }, selectedTasks[0].assigned_to)
              : null,
          due_date:
            selectedTasks && selectedTasks.length > 0
              ? selectedTasks?.reduce((acc, curr) => {
                  if (!curr.due_date) return acc;
                  if (!acc) return curr.due_date;

                  return acc < curr.due_date ? acc : curr.due_date;
                }, selectedTasks[0].due_date)
              : null,
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
          <Box display={'flex'} flexDirection={'row'}>
            <TaskForm.DueDate />
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <TaskForm.AssignedTo />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={onClose}>
            Annuller
          </Button>
          <TaskForm.SubmitButton />
        </DialogActions>
      </TaskForm>
    </Dialog>
  );
};

export default CreateItineraryDialog;
