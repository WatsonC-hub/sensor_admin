import {Box, Dialog, IconButton, Typography} from '@mui/material';
import React from 'react';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import {useTaskItinerary} from '~/features/tasks/api/useTaskItinerary';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useAppContext} from '~/state/contexts';
import {useTasks} from '~/features/tasks/api/useTasks';
import CloseIcon from '@mui/icons-material/Close';
import TaskListItemSimpleCard from './TaskListItemSimpleCard';
import TaskListItemAdvancedCard from './TaskListItemAdvancedCard';
import Button from '~/components/Button';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const ItineraryCardList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [openDialog, setOpenDialog] = React.useState(false);
  const {tasks} = useTaskStore();
  const itinerary_tasks = tasks?.filter(
    (task) => task.loc_id === loc_id && task.itinerary_id !== null
  );

  const {
    getUsers: {data: taskUsers},
    deleteTaskFromItinerary,
  } = useTasks();

  const {
    get: {data: itineraries},
  } = useTaskItinerary();

  const itinerary = itineraries?.find(
    (itinerary) => itinerary.id === itinerary_tasks?.[0]?.itinerary_id
  );

  if (!itinerary) return null;

  const handleDelete = () => {
    const payload = {
      path: `${itinerary.id}/tasks/${loc_id}`,
    };

    deleteTaskFromItinerary.mutate(payload);
    setOpenDialog(false);
  };

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Box
        display="flex"
        gap={1}
        borderRadius={2.5}
        flexDirection={'row'}
        color={'white'}
        justifyContent={'space-between'}
        sx={{backgroundColor: '#B87333', p: 1}}
      >
        <Box display="flex" alignItems={'center'} flexDirection={'row'} gap={1}>
          <DriveEtaIcon />
          <Typography variant="caption">{itinerary?.due_date}</Typography>
        </Box>
        <Typography alignContent={'center'} variant="caption">
          {taskUsers?.find((user) => user.id === itinerary?.assigned_to)?.display_name}
        </Typography>
        <IconButton onClick={() => setOpenDialog(true)}>
          <CloseIcon sx={{alignSelf: 'center', color: 'white'}} fontSize="small" />
        </IconButton>
      </Box>
      <Box pl={1}>
        {itinerary_tasks?.map((task) => {
          const isSimpleTask =
            task.id.includes(':') || task.description === null || task.description === '';
          return (
            <Box key={task.id}>
              {isSimpleTask ? (
                <TaskListItemSimpleCard task={task} />
              ) : (
                <TaskListItemAdvancedCard task={task} />
              )}
            </Box>
          );
        })}
      </Box>
      {openDialog && (
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <Box p={2}>
            <Typography variant="body2">
              Er du sikker på at du vil fjerne lokationen fra turen?
            </Typography>
            <Box display="flex" gap={1} justifyContent={'flex-end'} mt={2}>
              <Button bttype="tertiary" onClick={() => setOpenDialog(false)}>
                Annuller
              </Button>
              <Button
                bttype="primary"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={() => handleDelete()}
              >
                Fjern
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default ItineraryCardList;
