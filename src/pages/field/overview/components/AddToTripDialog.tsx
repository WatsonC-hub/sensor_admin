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

type AddToTripDialogProps = {
  open: boolean;
  onClose: () => void;
  loc_id: number;
};

const AddToTripDialog = ({open, onClose, loc_id}: AddToTripDialogProps) => {
  const [itineraryId, setItineraryId] = React.useState<string | null>(null);
  const {
    get: {data: itineraries},
    addLocationToTrip,
  } = useTaskItinerary();

  const {
    getUsers: {data: taskUsers},
  } = useTasks();

  const handleClose = () => {
    onClose();
    setItineraryId(null);
  };

  const onSubmit = () => {
    // Get the tasks that belong to the selected itinerary

    addLocationToTrip.mutate(
      {
        path: `${itineraryId}`,
        data: {
          loc_id: [loc_id],
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
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
