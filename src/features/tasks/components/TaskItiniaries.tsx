import {Box, Grid, Typography} from '@mui/material';
import React, {useState} from 'react';

import Button from '~/components/Button';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

import {useTaskItinerary} from '../api/useTaskItinerary';
import {Task} from '../types';

import CreateItineraryDialog from './CreateItineraryDialog';
import Droppable from './Droppable';
import TaskItineraryCard from './TaskItiniaryCard';

const TaskItiniaries = () => {
  const [ids, setIds] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const {selectedLocIds} = useTaskStore();
  const {taskManagementSearch} = useNavigationFunctions();
  const {
    get: {data},
  } = useTaskItinerary();

  return (
    <Box>
      <Button
        bttype="primary"
        size="large"
        onClick={() => {
          taskManagementSearch(selectedLocIds);
        }}
        disabled={selectedLocIds.length === 0}
      >
        Se tur ud fra selection
      </Button>
      <Grid container gap={1} spacing={2} display={'flex'} flexDirection={'row'}>
        <Grid item mobile={12} tablet={3} laptop={2.5} ml={0.5}>
          <Droppable<Task>
            onDrop={(e, data) => {
              e.preventDefault();
              console.log('DROP');
              if (!ids.includes(data.id)) setIds([...ids, data.id]);
            }}
          >
            {({isDraggingOver}) => (
              <Box
                onClick={() => {
                  setDialogOpen(ids.length > 0 || selectedLocIds.length > 0);
                }}
                sx={{
                  width: '125px',
                  height: '100px',
                  textAlign: 'center',
                  justifyContent: 'center',
                  alignContent: 'center',
                  borderRadius: 2,
                  boxShadow: 8,
                  backgroundColor:
                    selectedLocIds.length > 0 && ids.length == 0
                      ? '#EEEEEE'
                      : isDraggingOver
                        ? 'secondary.light'
                        : 'primary.light',
                  color: 'primary.contrastText',
                  cursor: selectedLocIds.length > 0 && ids.length == 0 ? 'cursor' : 'pointer',
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
        <Grid item mobile={12} tablet={10} laptop={9.3} gap={1} container>
          {data?.map((itinerary) => <TaskItineraryCard key={itinerary.id} itinerary={itinerary} />)}
        </Grid>
      </Grid>
      {dialogOpen && (
        <CreateItineraryDialog ids={ids} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} />
      )}
    </Box>
  );
};

export default TaskItiniaries;
