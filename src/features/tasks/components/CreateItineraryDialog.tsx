import {Dialog, DialogTitle, DialogContent, Box, DialogActions} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';

import {useTaskItinerary} from '../api/useTaskItinerary';

import TaskForm, {FormValues} from './TaskForm';

type CreateItineraryDialogProps = {
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
};

const CreateItineraryDialog = ({dialogOpen, setDialogOpen}: CreateItineraryDialogProps) => {
  const {createItinerary} = useTaskItinerary();

  const onClose = () => {
    setDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    createItinerary.mutate(
      {
        loc_ids: [],
        due_date: data.due_date,
        assigned_to: data.assigned_to,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
        },
      }
    );
  };
  return (
    <Dialog open={dialogOpen} onClose={onClose}>
      <DialogTitle>Lav ny tur</DialogTitle>
      <TaskForm
        onSubmit={onSubmit}
        defaultValues={{
          assigned_to: null,
          due_date: null,
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
