import React, {useMemo} from 'react';

import AlertDialog from '~/components/AlertDialog';
import {useItineraryMutations} from '~/features/itinerary/api/useItinerary';
import {useTaskState} from '~/features/tasks/api/useTaskState';
import {StatusEnum} from '~/features/tasks/types';

type Props = {
  itinerary_id: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onCompleted: () => void;
};

/**
 * Confirms ending a tur by hand. Opgaver still in Feltarbejde are frigivet: they stay in
 * Feltarbejde but are no longer on the tur. Kept as its own component so time registration
 * can add a field for the time spent.
 */
const CompleteItineraryDialog = ({itinerary_id, open, setOpen, onCompleted}: Props) => {
  const {tasks} = useTaskState();
  const {
    complete: {mutate: completeItinerary, isPending},
  } = useItineraryMutations();

  const openWork = useMemo(() => {
    const remaining =
      tasks?.filter(
        (task) => task.itinerary_id === itinerary_id && task.status_id == StatusEnum.FIELD
      ) ?? [];
    return {
      tasks: remaining.length,
      locations: new Set(remaining.map((task) => task.loc_id)).size,
    };
  }, [tasks, itinerary_id]);

  const message =
    openWork.tasks > 0
      ? `${openWork.tasks} ${openWork.tasks === 1 ? 'opgave' : 'opgaver'} på ${openWork.locations} ${
          openWork.locations === 1 ? 'lokation' : 'lokationer'
        } er ikke færdige. De bliver frigivet fra turen og ligger herefter som uplanlagt feltarbejde.\n\nEr du sikker på at du vil afslutte turen?`
      : 'Er du sikker på at du vil afslutte turen? En afsluttet tur kan ikke ændres.';

  return (
    <AlertDialog
      open={open}
      setOpen={setOpen}
      title="Afslut tur"
      message={message}
      saveTitle="Afslut tur"
      handleOpret={() => {
        completeItinerary(
          {path: itinerary_id},
          {
            onSuccess: () => {
              setOpen(false);
              onCompleted();
            },
          }
        );
      }}
      loading={isPending}
    />
  );
};

export default CompleteItineraryDialog;
