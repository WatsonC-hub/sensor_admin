import {Card, CardContent, Typography} from '@mui/material';
import React from 'react';

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

  const {selectedTask} = useTaskStore();

  return (
    <Droppable
      onDrop={(e) => {
        e.preventDefault();
        console.log('DROP');
        console.log(e.dataTransfer.getData('text/plain'));
        console.log(selectedTask);
        console.log(itinerary.id);
        if (selectedTask)
          moveTask.mutate({
            path: `${itinerary.id}`,
            data: {task_ids: [selectedTask.id], loc_id: selectedTask.loc_id},
          });
      }}
    >
      {({isDraggingOver}) => (
        <Card
          sx={{
            textAlign: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            borderRadius: 2,
            boxShadow: 8,
            width: '200px',
            height: '125px',
            backgroundColor: isDraggingOver ? 'secondary.light' : 'primary.light',
            color: 'primary.contrastText',
            cursor: 'pointer',
          }}
          onClick={() => {
            taskManagement(itinerary.id);
          }}
        >
          <CardContent>
            <Typography variant="h6" component="div">
              {itinerary.due_date}
            </Typography>
            <Typography>
              {users?.find((user) => user.id === itinerary.assigned_to)?.display_name}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Droppable>
  );
};

export default TaskItineraryCard;
