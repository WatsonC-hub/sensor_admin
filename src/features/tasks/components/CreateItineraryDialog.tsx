import {Dialog, DialogTitle, DialogContent, Box, DialogActions} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';

import {useItineraryMutations} from '../api/useItinerary';

import TaskForm from './TaskForm';
import FormInput from '~/components/FormInput';

import {z} from 'zod';
import {zodDayjs} from '~/helpers/schemas';

type CreateItineraryDialogProps = {
  dialogOpen: boolean;
  setDialogOpen: (dialogOpen: boolean) => void;
};

const zodSchema = z.object({
  name: z
    .string({required_error: 'Navn skal være angivet'})
    .max(255, 'Navn må maks være 255 tegn')
    .optional(),
  due_date: zodDayjs().nullish(),
  assigned_to: z
    .string()
    .nullish()
    .transform((value) => (value === '' ? null : value)),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof zodSchema>;

const CreateItineraryDialog = ({dialogOpen, setDialogOpen}: CreateItineraryDialogProps) => {
  const {createItinerary} = useItineraryMutations();

  const onClose = () => {
    setDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    createItinerary.mutate(
      {
        loc_ids: [],
        due_date: data.due_date?.format('YYYY-MM-DD'),
        assigned_to: data.assigned_to,
        name: data.name ?? '',
        comment: data.comment ?? '',
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
          name: '',
          assigned_to: null,
          due_date: null,
        }}
        schema={zodSchema}
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
            <FormInput
              name="name"
              size="small"
              label="Tur navn"
              placeholder="Indtast navnet på turen..."
              required={false}
            />
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <TaskForm.DueDate />
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <TaskForm.AssignedTo />
          </Box>
          <Box display={'flex'} flexDirection={'row'}>
            <FormInput
              name="comment"
              size="small"
              label="Kommentar"
              placeholder="Indtast kommentar..."
              required={false}
              multiline
              minRows={3}
            />
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
