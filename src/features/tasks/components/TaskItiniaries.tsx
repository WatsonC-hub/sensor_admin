import {Box, Grid, Typography} from '@mui/material';
import React from 'react';

import Button from '~/components/Button';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import Droppable from './Droppable';
import TaskItineraryCard from './TaskItiniaryCard';

const TaskItiniaries = () => {
  const [ids, setIds] = React.useState<number[]>([]);
  const {selectedLocIds} = useTaskStore();
  const [isDragging, setIsDragging] = React.useState(false);
  const {taskManagement} = useNavigationFunctions();

  console.log(ids);
  return (
    <Box>
      <Button
        bttype="primary"
        size="large"
        onClick={() => {
          taskManagement(selectedLocIds);
        }}
        disabled={selectedLocIds.length === 0}
      >
        Se tur ud fra selection
      </Button>
      <Grid container spacing={8} p={2}>
        <Grid item xs={10} sm={5}>
          <Droppable
            onDrop={(e, data) => {
              e.preventDefault();
              console.log('DROP');
              setIds([...ids, data.loc_id]);
            }}
          >
            {({isDraggingOver}) => (
              <Box
                onClick={() => {
                  if (selectedLocIds.length > 0) {
                    taskManagement(selectedLocIds);
                    return;
                  }
                  if (ids.length > 0) taskManagement(ids);
                }}
                sx={{
                  width: '250px',
                  height: '250px',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                  borderRadius: 2,
                  boxShadow: 8,
                  backgroundColor: isDraggingOver ? 'secondary.light' : 'primary.light',
                  color: 'primary.contrastText',
                  cursor: 'pointer',
                }}
              >
                <Typography variant="h5" component="div">
                  Ny tur
                </Typography>
                {ids.map((id) => (
                  <Typography key={id} variant="body2" color="text.secondary">
                    {id}
                  </Typography>
                ))}
              </Box>
            )}
          </Droppable>
        </Grid>
        <Grid item xs={10} sm={5}>
          <TaskItineraryCard
            title="TaskItineraryCard"
            description="description"
            date="date"
            onButtonClick={() => {}}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskItiniaries;
