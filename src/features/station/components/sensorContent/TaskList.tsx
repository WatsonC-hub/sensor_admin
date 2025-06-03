import {Box, Typography, Tooltip, IconButton} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import React from 'react';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useAppContext} from '~/state/contexts';
import TaskListItemSimpleCard from './taskListItemComponents/TaskListItemSimpleCard';
import TaskListItemAdvancedCard from './taskListItemComponents/TaskListItemAdvancedCard';
import {Task} from '~/features/tasks/types';
import {isSimpleTask} from '~/features/tasks/helpers';

import {useLocationData} from '~/hooks/query/useMetadata';

const sortTasks = (a: Task, b: Task) => {
  if ((a.blocks_notifications.includes(1) || a.blocks_notifications.includes(207)) && !a.is_created)
    return -1;
  if ((b.blocks_notifications.includes(1) || b.blocks_notifications.includes(207)) && !b.is_created)
    return 1;

  return Number(a.is_created) - Number(b.is_created);
};

interface TaskListProps {
  setCreateTaskDialog: (open: boolean) => void;
}

const TaskList = ({setCreateTaskDialog}: TaskListProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const {tasks} = useTaskStore();
  const {data: location_data} = useLocationData(loc_id);

  const location_tasks = tasks
    ?.filter((task) => task.loc_id === loc_id && task.itinerary_id === null)
    .sort(sortTasks);

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Box
        display="flex"
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Typography variant="h6" fontWeight={'bold'}>
          Opgaver
        </Typography>
        <Tooltip
          title={
            location_data?.timeseries.length === 0
              ? 'Ingen tidsserie er fundet på denne lokation'
              : ''
          }
          arrow
        >
          <Box>
            <IconButton
              onClick={() => setCreateTaskDialog(true)}
              disabled={location_data?.timeseries.length === 0}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
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
