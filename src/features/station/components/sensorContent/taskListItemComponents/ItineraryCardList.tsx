import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import React from 'react';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import useTaskItinerary from '~/features/tasks/api/useTaskItinerary';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useAppContext} from '~/state/contexts';
import {useTasks} from '~/features/tasks/api/useTasks';
import CloseIcon from '@mui/icons-material/Close';

import ItineraryListItemSimpleCard from './ItineraryListItemSimpleCard';
import ItineraryListItemAdvancedCard from './ItineraryListItemAdvancedCard';
import Button from '~/components/Button';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {isSimpleTask} from '~/features/tasks/helpers';

interface ItineraryCardListProps {
  itinerary_id: string;
}

const ItineraryCardList = ({itinerary_id}: ItineraryCardListProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const [openDialog, setOpenDialog] = React.useState(false);
  const {tasks} = useTaskStore();

  const itinerary_tasks = tasks?.filter(
    (task) => task.loc_id === loc_id && task.itinerary_id == itinerary_id
  );

  const {
    getUsers: {data: taskUsers},
    deleteTaskFromItinerary,
  } = useTasks();

  const {
    get: {data: itineraries},
  } = useTaskItinerary();

  const itinerary = itineraries?.find((itinerary) => itinerary.id === itinerary_id);

  const handleDelete = () => {
    const payload = {
      path: `location/${loc_id}`,
    };

    deleteTaskFromItinerary.mutate(payload);
    setOpenDialog(false);
  };

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Card
        sx={{
          borderRadius: 2.5,
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'center',
        }}
      >
        <CardHeader
          sx={{
            width: '100%',
            backgroundColor: 'primary.main',
            color: 'white',
            py: 0.25,
            px: 2,
            minHeight: 32,
          }}
          title={
            <Box
              display="flex"
              flexDirection={'row'}
              alignItems="center"
              justifyContent={'space-between'}
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
          }
        />
        <CardContent
          sx={{
            py: 0.5,
            px: 0,
            backgroundColor: '#EBF0F0',
            '&.MuiCardContent-root:last-child': {py: 0},
          }}
        >
          <Box display={'flex'} flexDirection={'column'} gap={0.5}>
            {itinerary_tasks?.map((task) => {
              return (
                <div key={task.id}>
                  <Box sx={{px: 1, pt: 0.5}}>
                    {isSimpleTask(task) ? (
                      <ItineraryListItemSimpleCard task={task} />
                    ) : (
                      <ItineraryListItemAdvancedCard task={task} />
                    )}
                  </Box>
                  <Divider />
                </div>
              );
            })}
          </Box>
        </CardContent>
      </Card>
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
