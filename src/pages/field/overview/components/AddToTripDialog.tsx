import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Select,
  MenuItem,
} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {useTaskItinerary} from '~/features/tasks/api/useTaskItinerary';
import {useTasks} from '~/features/tasks/api/useTasks';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';

type AddToTripDialogProps = {
  open: boolean;
  onClose: () => void;
  loc_id: number;
};

const AddToTripDialog = ({open, onClose, loc_id}: AddToTripDialogProps) => {
  const [itineraryId, setItineraryId] = React.useState<string | null>(null);
  const {
    get: {data: itineraries},
  } = useTaskItinerary();

  const {tasks} = useTaskStore();

  const {
    getUsers: {data: taskUsers},
    moveTask,
  } = useTasks();

  const handleClose = () => {
    onClose();
    setItineraryId(null);
  };

  const onSubmit = () => {
    // Get the tasks that belong to the selected itinerary
    const itinerary_tasks = tasks?.filter((task) => task.itinerary_id === itineraryId);

    // Get the unique loc_ids from the tasks in the selected itinerary
    const loc_ids = [...new Set(itinerary_tasks?.map((task) => task.loc_id))];

    // Get the task_ids of the tasks that belong to the current selected location
    const task_ids = tasks?.filter((task) => task.loc_id === loc_id).map((task) => task.id);

    // If there are task_ids and the lokation has not already been added to itinerary, move the tasks
    if (task_ids && !loc_ids.includes(loc_id)) {
      moveTask.mutate(
        {
          path: `${itineraryId}`,
          data: {
            task_ids: task_ids,
            loc_id: [loc_id],
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Tilføj lokation til en tur</DialogTitle>
      <DialogContent>
        <Box p={2} m={2}>
          <Select
            fullWidth
            sx={{minWidth: 150}}
            value={itineraryId}
            onChange={(e) => setItineraryId(e.target.value)}
            defaultValue=""
            variant="outlined"
          >
            {itineraries?.map((itinerary) => (
              <MenuItem key={itinerary.id} value={itinerary.id}>
                {taskUsers?.find((user) => user.id === itinerary.assigned_to)?.display_name} -{' '}
                {itinerary.due_date}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" onClick={handleClose}>
          Annuller
        </Button>
        <Button bttype="primary" onClick={onSubmit}>
          Tilføj
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToTripDialog;
