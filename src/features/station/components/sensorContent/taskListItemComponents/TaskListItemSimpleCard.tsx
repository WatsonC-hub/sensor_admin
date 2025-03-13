import {Box, Button, Card, Typography} from '@mui/material';
import React from 'react';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {Task} from '~/features/tasks/types';
import {Edit} from '@mui/icons-material';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useNotificationOverviewMap} from '~/hooks/query/useNotificationOverview';
import {getColor} from '~/features/notifications/utils';

type Props = {
  task: Task;
};

const TaskListItemSimpleCard = ({task}: Props) => {
  const {setSelectedTask} = useTaskStore();
  const {data} = useNotificationOverviewMap();

  const locationData = data?.find((item) => item.loc_id === task.loc_id);

  const notification =
    locationData &&
    [locationData, ...locationData.otherNotifications].find(
      (item) => item.ts_id === task.ts_id && !task.is_created
    );

  console.log(task);

  const contrastColor = task.itinerary_id ? '' : task.status_id === 1 ? 'white' : 'primary';
  const color = task.itinerary_id
    ? '	#EADDCA'
    : task.status_id === 1
      ? getColor({...notification})
      : 'white';

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        display: 'flex',
        padding: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
        backgroundColor: color,
        opacity: task.itinerary_id ? 0.7 : 1,
      }}
      variant="elevation"
    >
      <Box display="flex" gap={1} alignItems="center" sx={{color: contrastColor}}>
        <AssignmentOutlinedIcon fontSize="small" />
        <Typography variant="caption" width={200}>
          {task.name}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" sx={{color: contrastColor}}>
        <Edit sx={{color: task.itinerary_id ? 'primary.main' : ''}} fontSize="small" />
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
