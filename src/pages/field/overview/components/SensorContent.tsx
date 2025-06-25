import {Box, Tooltip} from '@mui/material';
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
import {useUser} from '~/features/auth/useUser';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {StatusEnum} from '~/features/tasks/types';
import TooltipWrapper from '~/components/TooltipWrapper';

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
  const user = useUser();
  const {tasks} = useTaskStore();

  const {data: location} = useMapOverview({
    select: (data) => {
      return data.find((location) => location.loc_id === loc_id);
    },
  });

  const enableDragToTrip = tasks?.some(
    (task) => task.loc_id === loc_id && task.status_id == StatusEnum.FIELD
  );

  return (
    <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={3} overflow="auto">
      <LocationInfo />
      <TimeseriesList />
      {user?.simpleTaskPermission && <TaskList setCreateTaskDialog={setCreateTaskDialog} />}
      {location?.itinerary_id && user?.advancedTaskPermission && (
        <ItineraryCardList itinerary_id={location.itinerary_id} />
      )}

      {user?.advancedTaskPermission && (
        <Box display="flex" gap={2} flexDirection={'row'} alignSelf={'center'}>
          <Tooltip
            title={
              !enableDragToTrip
                ? 'Lav en opgave til feltarbejde for at kunne trække til tur'
                : 'Træk til tur for at tilføje opgaver'
            }
            arrow
          >
            {!isMobile ? (
              <Box
                display="flex"
                ref={ref}
                flexDirection={'row'}
                alignItems={'center'}
                alignSelf={'center'}
              >
                <TooltipWrapper description="Træk for at tilføje denne lokation til en eksisterende tur. Når du trækker lokationen, vil tur listen automatisk blive vist.">
                  <Button
                    bttype="primary"
                    startIcon={<DragIndicatorIcon sx={{cursor: 'grab'}} fontSize="small" />}
                    disabled={!enableDragToTrip}
                  >
                    Træk til tur
                  </Button>
                </TooltipWrapper>
              </Box>
            ) : (
              <Box display="flex" flexDirection={'row'} alignItems={'center'} alignSelf={'center'}>
                <Button
                  bttype="primary"
                  onClick={() => setOpenTripDialog(true)}
                  startIcon={<DriveEtaIcon sx={{cursor: 'auto'}} fontSize="small" />}
                  disabled={!enableDragToTrip}
                >
                  Tilføj til tur
                </Button>
              </Box>
            )}
          </Tooltip>
        </Box>
      )}

      {user?.simpleTaskPermission && <TaskHistoryList />}

      {user?.simpleTaskPermission && (
        <CreateManuelTaskModal
          open={createTaskDialog}
          closeModal={() => setCreateTaskDialog(false)}
        />
      )}
      {user?.advancedTaskPermission && (
        <AddToTripDialog
          open={openTripDialog}
          onClose={() => setOpenTripDialog(false)}
          loc_id={loc_id}
        />
      )}
    </Box>
  );
};

export default SensorContent;
