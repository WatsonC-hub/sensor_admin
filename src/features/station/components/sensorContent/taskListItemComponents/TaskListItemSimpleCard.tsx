import {Box, Button, Card, Typography} from '@mui/material';
import React from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import {Task} from '~/features/tasks/types';
import {Edit} from '@mui/icons-material';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useNotificationOverviewMap} from '~/hooks/query/useNotificationOverview';
import {getColor} from '~/pages/field/overview/components/NotificationIcon';

type Props = {
  task: Task;
};

const TaskListItemSimpleCard = ({task}: Props) => {
  const {setSelectedTask} = useTaskStore();
  const {data} = useNotificationOverviewMap();

  const locationData = data?.find((item) => item.loc_id === task.loc_id);

  const notification =
    locationData &&
    [locationData, ...locationData.otherNotifications].find((item) => item.ts_id === task.ts_id);

  const contrastColor = task.status_id === 1 ? 'white' : 'primary';
  const color = task.status_id === 1 ? getColor({...notification}) : 'white';
  return (
    <Card
      sx={{
        borderRadius: 4,
        display: 'flex',
        padding: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
        backgroundColor: color,
      }}
      variant="elevation"
    >
      <Box display="flex" gap={1} alignItems="center" sx={{color: contrastColor}}>
        <AssignmentIcon fontSize="small" />
        <Typography variant="caption" width={200}>
          {task.name}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" sx={{color: contrastColor}}>
        <Edit fontSize="small" />
        <Button
          variant="text"
          size="small"
          onClick={() => setSelectedTask(task.id)}
          sx={{textTransform: 'initial', color: contrastColor}}
        >
          Rediger opgave
        </Button>
      </Box>
    </Card>
  );
};

export default TaskListItemSimpleCard;
