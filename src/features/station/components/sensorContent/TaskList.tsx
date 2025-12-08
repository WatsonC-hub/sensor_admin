import {Box, Typography, Tooltip, IconButton} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import React from 'react';
import {useTaskState} from '~/features/tasks/api/useTaskState';
import {useAppContext} from '~/state/contexts';
import TaskListItemSimpleCard from './taskListItemComponents/TaskListItemSimpleCard';
import TaskListItemAdvancedCard from './taskListItemComponents/TaskListItemAdvancedCard';
import {Task} from '~/features/tasks/types';
import {isSimpleTask} from '~/features/tasks/helpers';

import {useLocationData} from '~/hooks/query/useMetadata';
import {useUser} from '~/features/auth/useUser';
import TooltipWrapper from '~/components/TooltipWrapper';
import TaskListItemNoneCard from './taskListItemComponents/TaskListItemNoneCard';

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
  const {tasks} = useTaskState();
  const {advancedTaskPermission, simpleTaskPermission} = useUser();
  const {data: location_data} = useLocationData(loc_id);

  const location_tasks = tasks
    ?.filter(
      (task) => task.loc_id === loc_id && (task.itinerary_id === null || !advancedTaskPermission)
    )
    .sort(sortTasks);

  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Box
        display="flex"
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <TooltipWrapper
          description="Opgaver kan oprettes ud fra notifikationer eller som manuelle opgaver. En opgave kan være simpel eller avanceret. En simpel opgave er en opgave, der ikke kræver yderligere information, mens en avanceret opgave kan have flere detaljer og krav. Dette har en betydning når man skal lave ture. Læs mere om opgaver i dokumentationen."
          url="https://www.watsonc.dk/guides/opgavestyring/"
        >
          <Typography variant="h6" fontWeight={'bold'}>
            Opgaver
          </Typography>
        </TooltipWrapper>
        <>
          {simpleTaskPermission && (
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
          )}
        </>
      </Box>
      {location_tasks?.map((task) => {
        return (
          <Box key={task.id}>
            {simpleTaskPermission === true ? (
              isSimpleTask(task) ? (
                <TaskListItemSimpleCard task={task} />
              ) : (
                <TaskListItemAdvancedCard task={task} />
              )
            ) : (
              <TaskListItemNoneCard task={task} />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TaskList;
