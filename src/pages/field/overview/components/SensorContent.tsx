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

const SensorContent = () => {
  const {loc_id} = useAppContext([], ['loc_id']);
  const setIsDraggingTask = useRawTaskStore((state) => state.setIsDraggingTask);
  const [createTaskDialog, setCreateTaskDialog] = useState(false);
  return (
    <Box display={'flex'} flexDirection={'column'} py={3} px={2} gap={3}>
      <LocationInfo />
      <TimeseriesList />
      <TaskList />
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
          Tilføj lokation til tur
        </Button>
        <Button
          bttype="primary"
          sx={{borderRadius: 2.5}}
          onClick={() => setCreateTaskDialog(true)}
          startIcon={<AssignmentIcon fontSize="small" />}
        >
          Opret en opgave
        </Button>
      </Box>

      <CreateManuelTaskModal
        open={createTaskDialog}
        closeModal={() => setCreateTaskDialog(false)}
      />

      {/* <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {unique_stations.map((notification, index) => {
          const splitted = notification.ts_name.split(notification.loc_name);
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              <Button bttype="link" onClick={() => station(notification.ts_id)}>
                {splitted[splitted.length - 1].replace('-', '').trim()}
              </Button>
              <Box display="flex" gap={0.5}>
                <NotificationIcon iconDetails={notification} />
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography variant="h6">Notifikationer</Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {all_notifications
          .filter((item) => item.opgave !== null)
          .map((notification, index) => {
            // notification.notification_id;
            const splitted = notification.ts_name.split(notification.loc_name);
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Button
                  bttype="link"
                  onClick={() => {
                    setSelectedTask(`${notification.ts_id}:${notification.notification_id}`);
                  }}
                >
                  {splitted[splitted.length - 1].replace('-', '').trim()}
                </Button>
                <Box display="flex" gap={1}>
                  <NotificationIcon iconDetails={notification} />
                  <Typography variant="body2">{notification.opgave}</Typography>
                </Box>
                <Typography variant="body2">
                  {convertDateWithTimeStamp(notification.dato)}
                </Typography>
              </Box>
            );
          })}
      </Box>
      <Typography variant="h6">Opgaver</Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {all_tasks.map((task, index) => {
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              <Button bttype="link" onClick={() => setSelectedTask(task.id)} color="primary">
                {task.name}
              </Button>
              <Typography variant="body2">{task.due_date}</Typography>
            </Box>
          );
        })}
      </Box> */}
      {/* <Typography variant="h6">Opgaver</Typography> */}
    </Box>
  );
};

export default SensorContent;
