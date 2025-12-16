import {zodResolver} from '@hookform/resolvers/zod';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {z} from 'zod';
import AlertDialog from '~/components/AlertDialog';
import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import useTaskItinerary from '~/features/tasks/api/useTaskItinerary';
import {useDisplayState} from '~/hooks/ui';
import MoveUpIcon from '@mui/icons-material/MoveUp';

type Props = {
  itinerary_id: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type FormValues = {
  target_itinerary_id: string;
};

const TripMergeDialog = ({itinerary_id, open, setOpen}: Props) => {
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const setItineraryId = useDisplayState((state) => state.setItineraryId);
  const {
    mergeTrips,
    get: {data: itineraries},
    getItinerary: {data: itinerary},
  } = useTaskItinerary(itinerary_id);

  const formMethods = useForm<FormValues>({
    resolver: zodResolver(
      z.object({
        target_itinerary_id: z.string({required_error: 'Vælg en tur'}).min(1, 'Vælg en tur'),
      })
    ),
    mode: 'onTouched',
  });

  const {handleSubmit, reset} = formMethods;

  const onClose = () => {
    reset();
    setOpen(false);
  };

  const handleSave: SubmitHandler<FormValues> = (data) => {
    const payload = {
      path: `${itinerary_id}`,
      data: data,
    };

    mergeTrips.mutate(payload, {
      onSuccess: () => {
        onClose();
        setItineraryId(null);
      },
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider {...formMethods}>
        <DialogTitle>Overflyt lokationer for {itinerary?.name}</DialogTitle>
        <DialogContent>
          <FormInput
            name="target_itinerary_id"
            label="Turliste"
            placeholder="Overflyt til..."
            select
            required
            options={itineraries
              ?.filter((itinerary) => itinerary.id !== itinerary_id)
              ?.map((itinerary) => ({[itinerary.id.toString()]: itinerary.name}))}
          />
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={onClose}>
            Luk
          </Button>
          <Button
            bttype="primary"
            onClick={() => setOpenDialog(true)}
            startIcon={<MoveUpIcon sx={{transform: 'rotate(90deg)'}} />}
          >
            Overflyt
          </Button>
        </DialogActions>
        <AlertDialog
          open={openDialog}
          title="Bekræft flytning"
          message="Er du sikker på, at du vil flytte alle lokationer fra denne tur til den valgte tur?"
          setOpen={setOpenDialog}
          handleOpret={handleSubmit(handleSave)}
        />
      </FormProvider>
    </Dialog>
  );
};

export default TripMergeDialog;
