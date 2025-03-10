import {Box, Button, Card, Typography} from '@mui/material';
import React from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {Task} from '~/features/tasks/types';
import {Edit} from '@mui/icons-material';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';

type Props = {
  task: Task;
};

const TaskListItemSimpleCard = ({task}: Props) => {
  const {setSelectedTask} = useTaskStore();
  return (
    <Card
      sx={{
        borderRadius: 4,
        display: 'flex',
        padding: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
      }}
      variant="elevation"
    >
      <Box display="flex" gap={1} alignItems="center">
        <AssignmentIcon fontSize="small" />
        <Typography variant="caption" width={200}>
          {task.name}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Edit fontSize="small" color="primary" />
        <Button
          variant="text"
          size="small"
          onClick={() => setSelectedTask(task.id)}
          sx={{textTransform: 'initial'}}
        >
          Rediger opgave
        </Button>
      </Box>
    </Card>
  );
};

export default TaskListItemSimpleCard;
