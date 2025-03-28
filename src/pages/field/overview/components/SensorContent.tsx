import {Box, Tooltip, Typography} from '@mui/material';
import Button from '~/components/Button';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LocationInfo from '~/features/station/components/sensorContent/LocationInfo';
import TaskList from '~/features/station/components/sensorContent/TaskList';
import TimeseriesList from '~/features/station/components/sensorContent/TimeseriesList';
import {useAppContext} from '~/state/contexts';
import {useState} from 'react';
import CreateManuelTaskModal from '~/features/tasks/components/CreateManuelTaskModal';
import ItineraryCardList from '~/features/station/components/sensorContent/taskListItemComponents/ItineraryCardList';
import TaskHistoryList from '~/features/station/components/sensorContent/TaskHistoryList';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';

const SensorContent = () => {
  const {loc_id} = useAppContext([], ['loc_id']);
  const [createTaskDialog, setCreateTaskDialog] = useState(false);
  const {tasks} = useTaskStore();

  const filteredTasks = tasks?.filter((task) => task.loc_id === loc_id);
  const hasFieldTasks =
    (filteredTasks ?? []).filter((task) => task.itinerary_id !== null).length > 0;
  return (
    <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={3}>
      <LocationInfo />
      <TimeseriesList />
      <TaskList />
      <ItineraryCardList />

      <Box display="flex" gap={1} flexDirection={'row'} alignSelf={'center'}>
        <Tooltip
          title={
            hasFieldTasks ? undefined : (
              <Typography variant="body2">
                Mangler felt opgaver for at kunne trække lokationen til tur
              </Typography>
            )
          }
        >
          <Button
            draggable={hasFieldTasks}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', JSON.stringify({loc_id: loc_id}));
            }}
            disableRipple={!hasFieldTasks}
            disableFocusRipple={!hasFieldTasks}
            disableTouchRipple={!hasFieldTasks}
            disableElevation={!hasFieldTasks}
            bttype="itinerary"
            startIcon={<DragIndicatorIcon fontSize="small" />}
            sx={{
              borderRadius: 2.5,
              cursor: !hasFieldTasks ? 'default' : 'move',
              ':hover': {bgcolor: !hasFieldTasks ? 'grey.100' : undefined},
            }}
          >
            Træk lokation til tur
          </Button>
        </Tooltip>
        <Button
          bttype="primary"
          sx={{borderRadius: 2.5}}
          onClick={() => setCreateTaskDialog(true)}
          startIcon={<AssignmentIcon fontSize="small" />}
        >
          Opret ny opgave
        </Button>
      </Box>

      <TaskHistoryList />

      <CreateManuelTaskModal
        open={createTaskDialog}
        closeModal={() => setCreateTaskDialog(false)}
      />
    </Box>
  );
};

export default SensorContent;
