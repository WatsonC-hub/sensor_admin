import {Card, CardContent, Typography, CardActions, Button} from '@mui/material';
import React, {useRef} from 'react';

import Droppable from './Droppable';

interface TaskItineraryCardProps {
  title: string;
  description: string;
  date: string;
  onButtonClick: () => void;
}

const TaskItineraryCard: React.FC<TaskItineraryCardProps> = ({
  title,
  description,
  date,
  onButtonClick,
}) => {
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
        >
          <CardContent>
            <Typography variant="h5" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {date}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={onButtonClick}>
              Learn More
            </Button>
          </CardActions>
        </Card>
      )}
    </Droppable>
  );
};

export default TaskItineraryCard;
