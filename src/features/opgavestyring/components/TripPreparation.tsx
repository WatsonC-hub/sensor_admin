import {Box, IconButton, TextField, Typography} from '@mui/material';
import React, {useState} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
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
import useTaskItinerary from '~/features/tasks/api/useTaskItinerary';
import {useDisplayState} from '~/hooks/ui';
import LoadingSkeleton from '~/LoadingSkeleton';

interface TripPreparationProps {
  data: TaskCollection | undefined;
}

const TripPreparation = ({data}: TripPreparationProps) => {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [completeOpen, setCompleteOpen] = React.useState(false);
  const [editName, setEditName] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [itinerary_id, setItineraryId] = useDisplayState((state) => [
    state.itinerary_id,
    state.setItineraryId,
  ]);
  const {complete, patch: updateItinerary, getItinerary} = useTaskItinerary(itinerary_id);
  const {data: itinerary} = getItinerary;

  if (!itinerary) {
    return <LoadingSkeleton />;
  }

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      overflow={'auto'}
      gap={1}
      // sx={{paddingBottom: 'env(--safe-area-inset-bottom, 16px)'}}
    >
      <Box display="flex" alignItems={'center'} gap={1} mb={2}>
        {editName === false ? (
          <IconButton
            onClick={() => {
              setEditName(true);
              setName(itinerary.name);
            }}
            sx={{color: 'primary.main', width: 32, height: 32}}
          >
            <EditIcon sx={{p: 0.3}} />
          </IconButton>
        ) : (
          <IconButton
            onClick={() => {
              setEditName(false);
              if (name !== itinerary.name) {
                const payload = {
                  path: `${itinerary.id}`,
                  data: {
                    name: name,
                  },
                };
                updateItinerary.mutate(payload);
              }
            }}
            sx={{color: 'primary.main', width: 32, height: 32}}
          >
            <CheckIcon sx={{p: 0.3}} />
          </IconButton>
        )}
        {editName === false ? (
          <Typography
            ml={2}
            variant="h6"
            fontWeight={'bold'}
            fontSize={'1.2rem'}
            color={itinerary.name ? 'black' : 'text.secondary'}
          >
            {itinerary.name ? itinerary.name : 'Indtast tur navn...'}
          </Typography>
        ) : (
          <TextField
            key={itinerary.id}
            defaultValue={itinerary.name}
            size="small"
            variant={'outlined'}
            // disabled={editName === false}
            onBlur={(e) => {
              if ('value' in e.target && e.target.value !== itinerary.name) {
                const payload = {
                  path: `${itinerary.id}`,
                  data: {
                    name: e.target.value,
                  },
                };
                updateItinerary.mutate(payload);
              }
            }}
            slotProps={{
              input: {
                sx: {
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',

                  '& .MuiInputBase-input': {py: 0.5, pl: 2, height: '1.2rem'},
                },
              },
            }}
            placeholder="Indtast tur navn..."
          />
        )}
      </Box>

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
          Afslut tur
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
        title="Afslut tur"
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
