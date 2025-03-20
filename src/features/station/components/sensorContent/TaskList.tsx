import {Box, Typography} from '@mui/material';

import React from 'react';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useAppContext} from '~/state/contexts';
import TaskListItemSimpleCard from './taskListItemComponents/TaskListItemSimpleCard';
import TaskListItemAdvancedCard from './taskListItemComponents/TaskListItemAdvancedCard';

const TaskList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {tasks} = useTaskStore();
  const location_tasks = tasks
    ?.filter((task) => task.loc_id === loc_id && task.itinerary_id === null)
    .sort((a, b) => {
      return Number(a.is_created) - Number(b.is_created);
    });

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Typography variant="h6" fontWeight={'bold'}>
        Opgaver
      </Typography>
      {location_tasks?.map((task) => {
        const isSimpleTask =
          task.id.includes(':') || task.description === null || task.description === '';

        return (
          <Box key={task.id}>
            {isSimpleTask ? (
              <TaskListItemSimpleCard task={task} />
            ) : (
              <TaskListItemAdvancedCard task={task} />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TaskList;
