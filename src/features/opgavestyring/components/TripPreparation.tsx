import {Box} from '@mui/material';
import React, {useState} from 'react';

import Button from '~/components/Button';
import AlertDialog from '~/components/AlertDialog';
import LoadingSkeleton from '~/LoadingSkeleton';

import {Check} from '@mui/icons-material';
import MoveUpIcon from '@mui/icons-material/MoveUp';

import TripContacts from './TripContacts';
import TripLocationAccess from './TripLocationAccess';
import TripMergeDialog from './TripMergeDialog';
import TripRessourcesTable from '~/features/opgavestyring/components/TripRessourcesTable';
import TripTaskTable from './TripTaskTable';
import TripUnitTable from '~/features/opgavestyring/components/TripUnitTable';

import {useDisplayState} from '~/hooks/ui';
import {useItinerary, useItineraryMutations} from '~/features/tasks/api/useItinerary';
import EditableField from '~/components/EditableField';
import {TaskCollection} from '~/types';

interface TripPreparationProps {
  data: TaskCollection | undefined;
}

const TripPreparation = ({data}: TripPreparationProps) => {
  const [completeOpen, setCompleteOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const [itinerary_id, setItineraryId] = useDisplayState((state) => [
    state.itinerary_id,
    state.setItineraryId,
  ]);

  const {
    complete: {mutate: completeItinerary, isPending: isCompletePending},
    patch: {mutate: updateItinerary},
  } = useItineraryMutations();

  const {data: itinerary} = useItinerary(itinerary_id);

  if (!itinerary) {
    return <LoadingSkeleton />;
  }

  const updateField = (field: 'name' | 'comment', value: string | null) => {
    updateItinerary({
      path: `${itinerary.id}`,
      data: {
        [field]: value,
      },
    });
  };

  return (
    <Box display="flex" flexDirection="column" overflow="auto" gap={1}>
      <EditableField
        label={itinerary.name}
        placeholder="Indtast navn..."
        variant="title"
        onSave={(value) => updateField('name', value)}
      />

      <EditableField
        label={itinerary.comment}
        placeholder="Indtast kommentar..."
        multiline
        onSave={(value) => updateField('comment', value)}
      />

      <TripRessourcesTable ressources={data?.ressourcer} />
      <TripLocationAccess keys={data?.location_access} />
      <TripContacts contacts={data?.contacts} />
      <TripTaskTable tasks={data?.tasks} />
      <TripUnitTable units={data?.units} />

      <Box display="flex" gap={1} alignSelf="center">
        <Button
          bttype="primary"
          sx={{borderRadius: 2.5}}
          startIcon={<MoveUpIcon sx={{transform: 'rotate(90deg)'}} />}
          onClick={() => setMergeOpen(true)}
        >
          Overflyt tur
        </Button>

        <Button
          bttype="tertiary"
          sx={{borderRadius: 2.5}}
          startIcon={<Check />}
          onClick={() => setCompleteOpen(true)}
        >
          Afslut tur
        </Button>
      </Box>

      <TripMergeDialog itinerary_id={itinerary_id!} open={mergeOpen} setOpen={setMergeOpen} />

      <AlertDialog
        open={completeOpen}
        setOpen={setCompleteOpen}
        title="Afslut tur"
        message="Er du sikker på at du vil færdiggøre turen?"
        handleOpret={() => {
          completeItinerary(
            {path: `${itinerary_id}`},
            {
              onSuccess: () => {
                setItineraryId(null);
                setCompleteOpen(false);
              },
            }
          );
        }}
        loading={isCompletePending}
      />
    </Box>
  );
};

export default TripPreparation;
