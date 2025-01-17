import {CardActions, CardContent, CardHeader, Divider, Typography} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';
import GenericCard from '~/components/GenericCard';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import {useTasks} from '../api/useTasks';
import {useTaskStore} from '../api/useTaskStore';
import {Taskitinerary} from '../types';

import Droppable from './Droppable';

interface TaskItineraryCardProps {
  itinerary: Taskitinerary;
}

const TaskItineraryCard: React.FC<TaskItineraryCardProps> = ({itinerary}) => {
  const {taskManagement} = useNavigationFunctions();

  const {
    getUsers: {data: users},
    moveTask,
  } = useTasks();

  const {selectedTask, isDraggingTask, selectedLocIds, tasks} = useTaskStore();

  return (
    <Droppable
      onDrop={(e) => {
        e.preventDefault();
        console.log('DROP');
        console.log(e.dataTransfer.getData('text/plain'));
        if (selectedTask)
          moveTask.mutate({
            path: `${itinerary.id}`,
            data: {task_ids: [selectedTask.id], loc_id: [selectedTask.loc_id]},
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
              width: '200px',
              backgroundColor:
                selectedTask?.itinerary_id === itinerary.id && isDraggingTask
                  ? 'yellow'
                  : isDraggingOver
                    ? 'secondary.light'
                    : '#00786D',
              color: 'primary.contrastText',
              cursor: 'pointer',
            }}
            identity={itinerary.id}
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
              <Button
                disabled={selectedLocIds.length > 0}
                onClick={() => {
                  moveTask.mutate({
                    path: `${itinerary.id}`,
                    data: {
                      task_ids: tasks
                        ? tasks
                            .filter((task) => selectedLocIds.includes(task.loc_id))
                            .map((task) => task.id)
                        : [],
                      loc_id: selectedLocIds,
                    },
                  });
                }}
                bttype="itinerary"
              >
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
            </CardActions>
          </GenericCard>
        );
      }}
    </Droppable>
  );
};

export default TaskItineraryCard;
