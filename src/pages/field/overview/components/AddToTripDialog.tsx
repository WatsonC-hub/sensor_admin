import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';
import {useItineraryMutations, useItineraries} from '~/features/tasks/api/useItinerary';
import {useTasks} from '~/features/tasks/api/useTasks';

type AddToTripDialogProps = {
  open: boolean;
  onClose: () => void;
  loc_id: number;
};

const AddToTripDialog = ({open, onClose, loc_id}: AddToTripDialogProps) => {
  const [itineraryId, setItineraryId] = React.useState<string | null>(null);
  const {data: itineraries} = useItineraries();
  const {addLocationToTrip} = useItineraryMutations();

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
        <Select
          fullWidth
          value={itineraryId}
          onChange={(e) => setItineraryId(e.target.value)}
          defaultValue=""
          variant="outlined"
        >
          {itineraries?.map((itinerary) => (
            <MenuItem
              key={itinerary.id}
              value={itinerary.id}
              sx={{display: 'flex', flexDirection: 'column'}}
            >
              <Typography variant="body1" ml={0} mr={'auto'}>
                {itinerary.name}
              </Typography>
              <Typography variant="caption" ml={1} mr={'auto'}>
                {taskUsers?.find((user) => user.id === itinerary.assigned_to)?.display_name}{' '}
                {itinerary.due_date}
              </Typography>
            </MenuItem>
          ))}
        </Select>
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
