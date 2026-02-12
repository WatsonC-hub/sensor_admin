import {Box, Tooltip} from '@mui/material';
import Button from '~/components/Button';
import LocationInfo from '~/features/station/components/sensorContent/LocationInfo';
import TaskList from '~/features/station/components/sensorContent/TaskList';
import TimeseriesList from '~/features/station/components/sensorContent/TimeseriesList';
import {useAppContext} from '~/state/contexts';
import {useCallback, useState} from 'react';
import CreateManuelTaskModal from '~/features/tasks/components/CreateManuelTaskModal';
import ItineraryCardList from '~/features/station/components/sensorContent/taskListItemComponents/ItineraryCardList';
import TaskHistoryList from '~/features/station/components/sensorContent/TaskHistoryList';
import {MapOverview, useMapOverview} from '~/hooks/query/useNotificationOverview';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {useDraggable} from '@dnd-kit/react';
import useBreakpoints from '~/hooks/useBreakpoints';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import AddToTripDialog from './AddToTripDialog';
import {useUser} from '~/features/auth/useUser';
import {useTaskState} from '~/features/tasks/api/useTaskState';
import {StatusEnum} from '~/features/tasks/types';

const SensorContent = () => {
  const {loc_id} = useAppContext(['loc_id'], []);
  const {isMobile} = useBreakpoints();
  const [createTaskDialog, setCreateTaskDialog] = useState(false);
  const [openTripDialog, setOpenTripDialog] = useState(false);
  const {advancedTaskPermission, simpleTaskPermission} = useUser();
  const {tasks} = useTaskState();
  const {data: location} = useMapOverview({
    select: useCallback(
      (data: MapOverview[]) => {
        return data.find((location) => location.loc_id === loc_id);
      },
      [loc_id]
    ),
  });

  const enableDragToTrip =
    tasks?.some((task) => task.loc_id === loc_id && task.status_id == StatusEnum.FIELD) ||
    (location?.not_serviced == true &&
      location?.inactive_new == true &&
      location?.in_service == false);

  const {ref} = useDraggable({
    id: 'location' + loc_id,
    data: {loc_id},
    feedback: 'clone',
    disabled: !enableDragToTrip,
  });

  return (
    <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={3} overflow="auto">
      <LocationInfo />
      <TimeseriesList />
      <TaskList setCreateTaskDialog={setCreateTaskDialog} />
      {location?.itinerary_id && advancedTaskPermission && (
        <ItineraryCardList itinerary_id={location.itinerary_id} />
      )}

      {advancedTaskPermission && (
        <Box display="flex" gap={2} flexDirection={'row'} alignSelf={'center'}>
          <Tooltip
            title={
              !enableDragToTrip
                ? 'Lav en opgave til feltarbejde for at kunne trække til tur'
                : 'Træk lokationen til en tur for at tilføje den til turen'
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
                <Button
                  bttype="primary"
                  startIcon={<DragIndicatorIcon sx={{cursor: 'grab'}} fontSize="small" />}
                  disabled={!enableDragToTrip}
                >
                  {!location?.itinerary_id ? 'Træk til tur' : 'Træk til anden tur'}
                </Button>
              </Box>
            ) : (
              <Box display="flex" flexDirection={'row'} alignItems={'center'} alignSelf={'center'}>
                <Button
                  bttype="primary"
                  onClick={() => setOpenTripDialog(true)}
                  startIcon={<DriveEtaIcon sx={{cursor: 'auto'}} fontSize="small" />}
                  disabled={!enableDragToTrip}
                >
                  {!location?.itinerary_id ? 'Tilføj til tur' : 'Tilføj til anden tur'}
                </Button>
              </Box>
            )}
          </Tooltip>
        </Box>
      )}

      {simpleTaskPermission && <TaskHistoryList />}

      {simpleTaskPermission && (
        <CreateManuelTaskModal
          open={createTaskDialog}
          closeModal={() => setCreateTaskDialog(false)}
        />
      )}
      {advancedTaskPermission && (
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
