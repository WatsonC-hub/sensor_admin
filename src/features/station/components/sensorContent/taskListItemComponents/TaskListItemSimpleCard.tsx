import {Box, Button, Card, Typography} from '@mui/material';
import React from 'react';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {Task} from '~/features/tasks/types';
import {Edit} from '@mui/icons-material';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {useNotificationOverview} from '~/hooks/query/useNotificationOverview';
import {getColor} from '~/features/notifications/utils';

type Props = {
  task: Task;
};

const TaskListItemSimpleCard = ({task}: Props) => {
  const {setSelectedTask} = useTaskStore();
  const {data: notification} = useNotificationOverview({
    select: (data) =>
      data.filter(
        (item) =>
          item.ts_id === task.ts_id &&
          !task.is_created &&
          item.notification_id != 0 &&
          item.notification_id == task.blocks_notifications[0]
      ),
  });

  // const notification = data && data.find((item) => item.ts_id === task.ts_id && !task.is_created);
  const color = task.itinerary_id
    ? '#fef9f4'
    : task.status_id === 1 && notification?.[0]
      ? getColor(notification[0])
      : 'white';

  return (
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
          sx={{backgroundColor: color, height: '100%', m: 0, p: 1}}
        >
          <AssignmentOutlinedIcon
            fontSize="small"
            sx={{
              color: task.status_id != 1 || task.is_created ? 'gray' : 'white',
            }}
          />
        </Box>
        <Typography variant="caption" width={200}>
          {task.name}
        </Typography>
      </Box>
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
    </Card>
  );
};

export default TaskListItemSimpleCard;
