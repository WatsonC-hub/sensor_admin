import {Box, Grid, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import Button from '~/components/Button';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';

import {useTaskItinerary} from '../api/useTaskItinerary';
import {Task} from '../types';

import Droppable from './Droppable';
import TaskItineraryCard from './TaskItiniaryCard';

const TaskItiniaries = () => {
  const [ids, setIds] = React.useState<string[]>([]);
  const {isMobile} = useBreakpoints();
  const [isColumn, setIsColumn] = useState<boolean>(false);
  const {selectedLocIds, tasks} = useTaskStore();
  const [{state}] = useStatefullTableAtom('taskTableState');
  const {taskManagementSearch} = useNavigationFunctions();
  const {
    get: {data},
    post,
  } = useTaskItinerary();

  useEffect(() => {
    setIsColumn(isMobile);
  }, [isMobile]);

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
      <Grid container p={1} gap={1} display={'flex'} flexDirection={isColumn ? 'column' : 'row'}>
        <Grid item xs={10} sm={1.5}>
          <Droppable<Task>
            onDrop={(e, data) => {
              e.preventDefault();
              console.log('DROP');
              setIds([...ids, data.id]);
            }}
          >
            {({isDraggingOver}) => (
              <Box
                onClick={() => {
                  // if (ids.length > 0) taskManagement(ids);
                  if (state?.rowSelection && tasks) {
                    const task_ids = Object.keys(state.rowSelection);

                    const selectedTasks = tasks.filter((task) => task_ids.includes(task.id));

                    const lowestDate = selectedTasks.reduce((acc, curr) => {
                      if (!curr.due_date) return acc;
                      if (!acc) return curr.due_date;

                      return acc < curr.due_date ? acc : curr.due_date;
                    }, selectedTasks[0].due_date);

                    // find assigned to if it is the same for all tasks
                    const assigned_to = selectedTasks.reduce((acc, curr) => {
                      if (!acc) return curr.assigned_to;
                      if (acc !== curr.assigned_to) return '';
                      return acc;
                    }, selectedTasks[0].assigned_to);

                    post.mutate({
                      task_ids: task_ids,
                      due_date: lowestDate,
                      assigned_to: assigned_to,
                    });
                  }
                }}
                sx={{
                  width: '125px',
                  height: '100px',
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
        <Grid
          item
          xs={10}
          sm={10}
          gap={2}
          display={'flex'}
          flexDirection={isColumn ? 'column' : 'row'}
        >
          {data?.map((itinerary) => <TaskItineraryCard key={itinerary.id} itinerary={itinerary} />)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskItiniaries;
