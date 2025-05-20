import {Box, Typography} from '@mui/material';
import React from 'react';

// import TripContactTable from '~/features/opgavestyring/components/TripContactTable';
// import TripKeysTable from '~/features/opgavestyring/components/TripKeysTable';
import TripRessourcesTable from '~/features/opgavestyring/components/TripRessourcesTable';
import TripUnitTable from '~/features/opgavestyring/components/TripUnitTable';
import {TaskCollection} from '~/types';
import TripTaskTable from './TripTaskTable';
import TripTaskCardList from './TripTaskCardList';
import Button from '~/components/Button';
import {Check} from '@mui/icons-material';
import AlertDialog from '~/components/AlertDialog';
import {useTaskItinerary} from '~/features/tasks/api/useTaskItinerary';
import {useDisplayState} from '~/hooks/ui';

interface TripPreparationProps {
  data: TaskCollection | undefined;
}

const TripPreparation = ({data}: TripPreparationProps) => {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [completeOpen, setCompleteOpen] = React.useState(false);
  const [itinerary_id, setItineraryId] = useDisplayState((state) => [
    state.itinerary_id,
    state.setItineraryId,
  ]);
  const {complete} = useTaskItinerary();
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      overflow={'auto'}
      gap={1}
      // sx={{paddingBottom: 'env(--safe-area-inset-bottom, 16px)'}}
    >
      {/* <Typography ml={2} variant="h5">
        Kontakter
      </Typography>
      <TripContactTable contacts={data?.contacts} />

      <Typography ml={2} variant="h5">
        Nøgler
      </Typography>
      <TripKeysTable keys={data?.location_access} />*/}

      <Typography ml={2} variant="h5">
        Pakkeliste
      </Typography>
      <TripRessourcesTable ressources={data?.ressourcer} />

      <TripTaskTable tasks={data?.tasks} />
      <TripTaskCardList data={data} />

      <Typography ml={2} variant="h5">
        Udstyr
      </Typography>
      <TripUnitTable units={data?.units} />

      <Box display="flex" gap={1} flexDirection={'row'} alignSelf={'center'}>
        <Button
          bttype="tertiary"
          sx={{borderRadius: 2.5}}
          startIcon={<Check />}
          onClick={() => {
            setCompleteOpen(true);
          }}
        >
          Færdiggør
        </Button>
        {/* <Button
          bttype="primary"
          sx={{borderRadius: 2.5}}
          startIcon={<Delete />}
          onClick={() => {
            setDeleteOpen(true);
          }}
        >
          Slet
        </Button> */}
      </Box>
      <AlertDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        title="Slet opgave"
        message="Er du sikker på at du vil slette opgaven?"
        handleOpret={() => {}}
      />
      <AlertDialog
        open={completeOpen}
        setOpen={setCompleteOpen}
        title="Færdiggør tur"
        message="Ansvarlig og forfaldsdato på alle opgaver på lokationer tilhørende turen ændres til turens ansvarlig og forfaldsdato. Turen bliver derefter færdiggjort. Er du sikker på at du vil færdiggøre turen?"
        // message="Færdiggørelse fjerner alle lokationer fra turen og ændrer ansvarlig på ikke færdiggjorte opgaver. Er du sikker på at du vil færdiggøre opgaven?"
        handleOpret={() => {
          complete.mutate({path: `${itinerary_id}`});
          setItineraryId(null);
        }}
      />
    </Box>
  );
};

export default TripPreparation;
