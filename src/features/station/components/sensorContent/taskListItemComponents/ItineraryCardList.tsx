import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  Divider,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import React from 'react';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import {useItinerary} from '~/features/tasks/api/useItinerary';
import {useTaskState} from '~/features/tasks/api/useTaskState';
import {useAppContext} from '~/state/contexts';
import {useTasks} from '~/features/tasks/api/useTasks';
import CloseIcon from '@mui/icons-material/Close';

import ItineraryListItemSimpleCard from './ItineraryListItemSimpleCard';
import ItineraryListItemAdvancedCard from './ItineraryListItemAdvancedCard';
import Button from '~/components/Button';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import {isSimpleTask} from '~/features/tasks/helpers';
import {useDisplayState} from '~/hooks/ui';
import dayjs from 'dayjs';
import {FlagEnum, sensorColors} from '~/features/notifications/consts';

interface ItineraryCardListProps {
  itinerary_id: string;
}

const ItineraryCardList = ({itinerary_id}: ItineraryCardListProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const [openDialog, setOpenDialog] = React.useState(false);
  const setItineraryId = useDisplayState((state) => state.setItineraryId);
  const {tasks} = useTaskState();

  const itinerary_tasks = tasks?.filter(
    (task) => task.loc_id === loc_id && task.itinerary_id == itinerary_id
  );

  const {
    getUsers: {data: taskUsers},
    deleteTaskFromItinerary,
  } = useTasks();

  const {data: itinerary} = useItinerary(itinerary_id);

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
            px: 1,
            minHeight: 32,
          }}
          title={
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
              <DriveEtaIcon
                sx={{
                  color:
                    itinerary?.due_date && dayjs(itinerary?.due_date).isBefore(dayjs(), 'day')
                      ? sensorColors[FlagEnum.WARNING].color
                      : 'white',
                }}
              />
              <Box display={'flex'} flexDirection={'column'}>
                <Link
                  sx={{cursor: 'pointer', textDecorationColor: 'rgba(255, 255, 255, 0.5)'}}
                  variant="caption"
                  underline="always"
                  color="inherit"
                  width={'100%'}
                  onClick={() => setItineraryId(itinerary_id)}
                >
                  <Typography variant="body2">{itinerary?.name}</Typography>
                </Link>
                <Typography variant="caption" color="grey.300">
                  {itinerary?.due_date}{' '}
                  {taskUsers?.find((user) => user.id === itinerary?.assigned_to) ? ' - ' : ''}
                  {taskUsers?.find((user) => user.id === itinerary?.assigned_to)?.display_name}
                </Typography>
              </Box>
              <Box flexGrow={1} alignItems={'center'} display={'flex'} justifyContent={'end'}>
                <IconButton onClick={() => setOpenDialog(true)}>
                  <CloseIcon sx={{color: 'white'}} fontSize="small" />
                </IconButton>
              </Box>
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
