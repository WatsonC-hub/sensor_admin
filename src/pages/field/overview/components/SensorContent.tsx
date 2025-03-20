import {Box} from '@mui/material';
import Button from '~/components/Button';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import LocationInfo from '~/features/station/components/sensorContent/LocationInfo';
import TaskList from '~/features/station/components/sensorContent/TaskList';
import TimeseriesList from '~/features/station/components/sensorContent/TimeseriesList';
import {useAppContext} from '~/state/contexts';
import {useRawTaskStore} from '~/features/tasks/store';
import {useState} from 'react';
import CreateManuelTaskModal from '~/features/tasks/components/CreateManuelTaskModal';
import ItineraryCardList from '~/features/station/components/sensorContent/taskListItemComponents/ItineraryCardList';

const SensorContent = () => {
  const {loc_id} = useAppContext([], ['loc_id']);
  const setIsDraggingTask = useRawTaskStore((state) => state.setIsDraggingTask);
  const [createTaskDialog, setCreateTaskDialog] = useState(false);
  return (
    <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={3}>
      <LocationInfo />
      <TimeseriesList />
      <TaskList />
      <ItineraryCardList />

      <Box display="flex" gap={1} flexDirection={'row'} alignSelf={'center'}>
        <Button
          draggable={true}
          onDragStart={(e) => {
            setIsDraggingTask(true);
            e.dataTransfer.setData('text/plain', JSON.stringify({loc_id: loc_id}));
          }}
          onDragEnd={() => {
            setIsDraggingTask(false);
          }}
          bttype="itinerary"
          startIcon={<DragIndicatorIcon fontSize="small" />}
          sx={{borderRadius: 2.5, cursor: 'move'}}
        >
          Træk lokation til tur
        </Button>
        <Button
          bttype="primary"
          sx={{borderRadius: 2.5}}
          onClick={() => setCreateTaskDialog(true)}
          startIcon={<AssignmentIcon fontSize="small" />}
        >
          Opret ny opgave
        </Button>
      </Box>

      <CreateManuelTaskModal
        open={createTaskDialog}
        closeModal={() => setCreateTaskDialog(false)}
      />
    </Box>
  );
};

export default SensorContent;
