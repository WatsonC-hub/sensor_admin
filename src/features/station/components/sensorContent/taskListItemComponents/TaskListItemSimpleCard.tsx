import {Box, Button, Card, Typography} from '@mui/material';
import React, {useMemo} from 'react';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {Task} from '~/features/tasks/types';
import {Edit} from '@mui/icons-material';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {getColor} from '~/features/notifications/utils';
import TaskForm from '~/features/tasks/components/TaskForm';
import {useTasks} from '~/features/tasks/api/useTasks';

type Props = {
  task: Task;
};

const TaskListItemSimpleCard = ({task}: Props) => {
  const {setSelectedTask} = useTaskStore();

  const {
    patch: updateTask,
    // getUsers: {data: taskUsers},
    getStatus: {data: taskStatus},
  } = useTasks();

  const unhandledTasks = task.status_id === 1 || task.assigned_to === null;
  const color = task.itinerary_id
    ? '#fef9f4'
    : unhandledTasks && task.flag
      ? getColor({flag: task.flag})
      : 'white';

  // const patchTaskAssignedTo = (assigned_to: string | null) => {
  //   const data = {
  //     ts_id: task.ts_id,
  //     assigned_to: assigned_to,
  //   };
  //   const payload = {
  //     path: task.id,
  //     data: data,
  //   };

  //   updateTask.mutate(payload);
  // };

  const patchTaskStatus = (status_id: number) => {
    const data = {
      ts_id: task.ts_id,
      status_id: status_id,
    };
    const payload = {
      path: task.id,
      data: data,
    };

    updateTask.mutate(payload);
  };

  const defaultValues = useMemo(() => {
    if (!task) return;
    return {
      status_id: task.status_id,
      // assigned_to: task.assigned_to,
    };
  }, [task]);

  return (
    <TaskForm key={task.id} onSubmit={() => {}} defaultValues={defaultValues}>
      <Card
        sx={{
          borderRadius: 2.5,
          display: 'flex',
          // padding: 1,
          backgroundColor: task.itinerary_id ? color : undefined,
          flexDirection: 'row',
          alignContent: 'center',
          justifyContent: 'space-between',
          // opacity: task.itinerary_id ? 0.7 : 1,
        }}
        variant="elevation"
      >
        <Box display="flex" gap={1} alignItems="center" color="grey.700">
          <Box
            display="flex"
            alignItems="center"
            sx={{backgroundColor: color, height: '100%', m: 0, py: 1, px: 1}}
          >
            <AssignmentOutlinedIcon
              fontSize="small"
              sx={{
                color: task.itinerary_id ? 'gray' : 'white',
              }}
            />
          </Box>
          <Box display="flex" flexDirection={'column'} alignItems={'start'}>
            <Typography variant="caption">{task.name}</Typography>
            <Box display="flex" alignItems="center">
              <Edit sx={{color: 'primary.main'}} fontSize="small" />
              <Button
                variant="text"
                size="small"
                onClick={() => setSelectedTask(task.id)}
                sx={{textTransform: 'initial'}}
              >
                Rediger opgave
              </Button>
            </Box>
          </Box>
        </Box>
        <Box gap={1} display="flex" alignItems={'center'}>
          <TaskForm.StatusSelect
            onBlurCallback={(event) => {
              if (typeof event !== 'number' && 'target' in event) {
                const status = taskStatus?.find(
                  (status) => status.id === parseInt(event.target.value)
                );
                if (status !== undefined && task.status_id !== status.id)
                  patchTaskStatus(status.id);
              }
            }}
            label={''}
            sx={{
              pb: 0,
              pr: 2,
              marginTop: 0.5,
              width: 150,
              '& .MuiOutlinedInput-notchedOutline': {
                fontSize: 'small',
                borderRadius: 2.5,
              },

              '& .MuiOutlinedInput-root': {
                backgroundColor: task.itinerary_id ? 'white' : '',
                fontSize: 'small',
              },
              '& .MuiInputLabel-root': {
                backgroundColor: 'white',
                transform: 'translate(10px, -9px) scale(0.9)',
              },
              '& .MuiSelect-select': {
                padding: '4px !important',
                pl: '14px !important',
              },
            }}
          />
          {/* <Person fontSize="small" /> */}
          {/* <TaskForm.AssignedToSelect
            onBlur={({target}) => {
              if ('value' in target) {
                const user = taskUsers?.find((user) => user.display_name === target.value);
                if (user !== undefined && task.assigned_to !== user.id)
                  patchTaskAssignedTo(user.id);
              }
            }}
            placeholder="Vælg ansvarlig"
            label=""
            sx={{
              p: 0,
              pr: 4,
              size: 'small',
              width: 150,
              '& .MuiSelect-select': {
                padding: '4px !important',
                pl: '14px !important',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderRadius: 2.5,
              },
              '& .MuiOutlinedInput-root': {
                fontSize: 'small',
              },
            }}
          /> */}
        </Box>
      </Card>
    </TaskForm>
  );
};

export default TaskListItemSimpleCard;
