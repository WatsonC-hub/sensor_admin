import {Box} from '@mui/material';
import Button from '~/components/Button';
import LocationInfo from '~/features/station/components/sensorContent/LocationInfo';
import TaskList from '~/features/station/components/sensorContent/TaskList';
import TimeseriesList from '~/features/station/components/sensorContent/TimeseriesList';
import {useAppContext} from '~/state/contexts';
import {useState} from 'react';
import CreateManuelTaskModal from '~/features/tasks/components/CreateManuelTaskModal';
import ItineraryCardList from '~/features/station/components/sensorContent/taskListItemComponents/ItineraryCardList';
import TaskHistoryList from '~/features/station/components/sensorContent/TaskHistoryList';
import {useMapOverview} from '~/hooks/query/useNotificationOverview';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {useDraggable} from '@dnd-kit/react';
import useBreakpoints from '~/hooks/useBreakpoints';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AddToTripDialog from './AddToTripDialog';

const SensorContent = () => {
  const {loc_id} = useAppContext(['loc_id'], []);
  const {ref} = useDraggable({
    id: 'location' + loc_id,
    data: {loc_id},
    feedback: 'clone',
  });
  const {isMobile} = useBreakpoints();
  const [createTaskDialog, setCreateTaskDialog] = useState(false);
  const [openTripDialog, setOpenTripDialog] = useState(false);

  const {data: location} = useMapOverview({
    select: (data) => {
      return data.find((location) => location.loc_id === loc_id);
    },
  });

  return (
    <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={3} overflow="auto">
      <LocationInfo />
      <TimeseriesList />
      <TaskList setCreateTaskDialog={setCreateTaskDialog} />
      {location?.itinerary_id && <ItineraryCardList itinerary_id={location.itinerary_id} />}

      <Box display="flex" gap={2} flexDirection={'row'} alignSelf={'center'}>
        {!isMobile ? (
          <Box
            display="flex"
            ref={ref}
            flexDirection={'row'}
            alignItems={'center'}
            alignSelf={'center'}
          >
            <Button
              bttype="primary"
              startIcon={<DragIndicatorIcon sx={{cursor: 'grab'}} fontSize="small" />}
            >
              Træk til tur
            </Button>
          </Box>
        ) : (
          <Box display="flex" flexDirection={'row'} alignItems={'center'} alignSelf={'center'}>
            <Button
              bttype="primary"
              onClick={() => setOpenTripDialog(true)}
              startIcon={<DriveEtaIcon sx={{cursor: 'auto'}} fontSize="small" />}
            >
              Tilføj til tur
            </Button>
          </Box>
        )}
      </Box>

      <TaskHistoryList />

      <CreateManuelTaskModal
        open={createTaskDialog}
        closeModal={() => setCreateTaskDialog(false)}
      />
      <AddToTripDialog
        open={openTripDialog}
        onClose={() => setOpenTripDialog(false)}
        loc_id={loc_id}
      />
    </Box>
  );
};

export default SensorContent;
