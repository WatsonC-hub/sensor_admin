import Check from '@mui/icons-material/Check';
import MoveUpIcon from '@mui/icons-material/MoveUp';
import {Box} from '@mui/material';
import React, {useState} from 'react';

import Button from '~/components/Button';
import {useItinerary} from '~/features/itinerary/api/useItinerary';
import CompleteItineraryDialog from '~/features/itinerary/components/CompleteItineraryDialog';
import TripRessourcesTable from '~/features/opgavestyring/components/TripRessourcesTable';
import TripUnitTable from '~/features/opgavestyring/components/TripUnitTable';
import {useDisplayState} from '~/hooks/ui';
import LoadingSkeleton from '~/LoadingSkeleton';

import TripContacts from './TripContacts';
import TripLocationAccess from './TripLocationAccess';
import TripMergeDialog from './TripMergeDialog';
import TripTaskTable from './TripTaskTable';

import type {TaskCollection} from '~/types';

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

  const {data: itinerary} = useItinerary(itinerary_id);

  if (!itinerary) {
    return <LoadingSkeleton />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {/* The name and comment are in the turvindue's header (ItineraryWindow). */}
      <TripRessourcesTable ressources={data?.ressourcer} />
      <TripLocationAccess keys={data?.location_access} />
      <TripContacts contacts={data?.contacts} />
      <TripTaskTable tasks={data?.tasks} />
      <TripUnitTable units={data?.units} />
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignSelf: 'center',
        }}
      >
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
      <CompleteItineraryDialog
        itinerary_id={itinerary.id}
        open={completeOpen}
        setOpen={setCompleteOpen}
        onCompleted={() => setItineraryId(null)}
      />
    </Box>
  );
};

export default TripPreparation;
