import {Card, CardContent, Typography} from '@mui/material';
import React from 'react';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import {Taskitinerary} from '../types';

import Droppable from './Droppable';

interface TaskItineraryCardProps {
  itinerary: Taskitinerary;
}

const TaskItineraryCard: React.FC<TaskItineraryCardProps> = ({itinerary}) => {
  const {taskManagement} = useNavigationFunctions();
  return (
    <Droppable
      onDrop={(e) => {
        e.preventDefault();
        console.log('DROP');
        console.log(e.dataTransfer.getData('text/plain'));
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
            width: '250px',
            height: '250px',
            backgroundColor: isDraggingOver ? 'secondary.light' : 'primary.light',
            color: 'primary.contrastText',
            cursor: 'pointer',
          }}
          onClick={() => {
            taskManagement(itinerary.id);
          }}
        >
          <CardContent>
            <Typography variant="h5" component="div">
              {itinerary.due_date}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Droppable>
  );
};

export default TaskItineraryCard;
