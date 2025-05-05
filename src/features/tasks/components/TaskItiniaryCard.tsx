import {CardActions, CardContent, CardHeader, Divider, Typography} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';
import GenericCard from '~/components/GenericCard';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import {useTasks} from '../api/useTasks';
import {useTaskStore} from '../api/useTaskStore';
import {Taskitinerary} from '../types';

import Droppable from './Droppable';
import {useTaskItinerary} from '../api/useTaskItinerary';

interface TaskItineraryCardProps {
  itinerary: Taskitinerary;
}

const TaskItineraryCard: React.FC<TaskItineraryCardProps> = ({itinerary}) => {
  const {taskManagement} = useNavigationFunctions();

  const {
    getUsers: {data: users},
  } = useTasks();

  const {complete, addLocationToTrip} = useTaskItinerary(itinerary.id);

  const {selectedTask, isDraggingTask, selectedLocIds, tasks} = useTaskStore();

  return (
    <Droppable<{loc_id: number}>
      onDrop={(e, data) => {
        e.preventDefault();
        addLocationToTrip.mutate({
          path: `${itinerary.id}`,
          data: {
            loc_id: [data.loc_id],
          },
        });
      }}
    >
      {({isDraggingOver}) => {
        return (
          <GenericCard
            sx={{
              textAlign: 'center',
              justifyContent: 'space-between',
              alignContent: 'center',
              borderRadius: 6,
              backgroundColor:
                selectedTask?.itinerary_id === itinerary.id && isDraggingTask
                  ? 'yellow'
                  : isDraggingOver
                    ? 'secondary.light'
                    : '#00786D',
              color: 'primary.contrastText',
              cursor: 'pointer',
            }}
            id={itinerary.id}
            shadowIn={8}
            shadowOut={2}
            shadowClick={12}
          >
            <CardHeader
              sx={{py: 1, px: 0.5}}
              title={
                <Typography>
                  {
                    tasks?.filter(
                      (task) => task.itinerary_id === itinerary.id && task.status_id === 3
                    ).length
                  }{' '}
                  ud af {tasks?.filter((task) => task.itinerary_id === itinerary.id).length}{' '}
                  afsluttet
                </Typography>
              }
            />
            <Divider color="white" />
            <CardContent>
              <Typography>
                {users?.find((user) => user.id === itinerary.assigned_to)?.display_name}
              </Typography>
              <Typography variant="h6" component="div">
                {itinerary.due_date}
              </Typography>
            </CardContent>
            <CardActions sx={{justifyContent: 'center'}}>
              <Button disabled={selectedLocIds.length === 0} onClick={() => {}} bttype="itinerary">
                Tilføj
              </Button>
              <Button
                onClick={() => {
                  taskManagement(itinerary.id);
                }}
                bttype="itinerary"
              >
                Se tur
              </Button>
              <Button
                onClick={() => {
                  complete.mutate({path: `${itinerary.id}`});
                }}
                bttype="itinerary"
              >
                Afslut
              </Button>
            </CardActions>
          </GenericCard>
        );
      }}
    </Droppable>
  );
};

export default TaskItineraryCard;
