import {Box, Typography} from '@mui/material';

import React from 'react';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useAppContext} from '~/state/contexts';
import TaskListItemSimpleCard from './taskListItemComponents/TaskListItemSimpleCard';
import TaskListItemAdvancedCard from './taskListItemComponents/TaskListItemAdvancedCard';
import {Task} from '~/features/tasks/types';
import {isSimpleTask} from '~/features/tasks/helpers';

const sortTasks = (a: Task, b: Task) => {
  if ((a.blocks_notifications.includes(1) || a.blocks_notifications.includes(207)) && !a.is_created)
    return -1;
  if ((b.blocks_notifications.includes(1) || b.blocks_notifications.includes(207)) && !b.is_created)
    return 1;

  return Number(a.is_created) - Number(b.is_created);
};

const TaskList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {tasks} = useTaskStore();
  const location_tasks = tasks
    ?.filter((task) => task.loc_id === loc_id && task.itinerary_id === null)
    .sort(sortTasks);

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Typography variant="h6" fontWeight={'bold'}>
        Opgaver
      </Typography>
      {location_tasks?.map((task) => {
        return (
          <Box key={task.id}>
            {isSimpleTask(task) ? (
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
