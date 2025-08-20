import {Card, CardHeader, Box, Typography, Link} from '@mui/material';
import React from 'react';
import {getColor} from '~/features/notifications/utils';
import {Task} from '~/features/tasks/types';
import {convertDate} from '~/helpers/dateConverter';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

type Props = {
  task: Task;
};

const TaskListItemNoneCard = ({task}: Props) => {
  const {station} = useNavigationFunctions();
  const color = getColor({
    flag: task.flag,
    has_task: task.is_created,
    due_date: task.due_date,
  });

  const isCreated = task.is_created;

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'space-between',
      }}
    >
      <CardHeader
        sx={{
          width: '100%',
          backgroundColor: isCreated ? 'primary.main' : color,
          color: 'white',
          py: 0.25,
          px: 2,
          minHeight: 32,
        }}
        title={
          <Box
            display="flex"
            flexDirection={'row'}
            alignItems="center"
            justifyContent={'space-between'}
          >
            <Box display={'flex'} flexDirection={'row'} gap={0.5} alignItems="center" fontSize={14}>
              <NotificationIcon
                iconDetails={{
                  notification_id: task.blocks_notifications[0],
                  flag: task.is_created ? null : task.flag,
                  has_task: task.is_created,
                  due_date: task.due_date,
                }}
                noCircle={true}
              />
              <Link
                onClick={() => station(task.ts_id)}
                color="inherit"
                variant="caption"
                underline="always"
                display="flex"
                flexWrap="wrap"
                gap={0.5}
                sx={{
                  cursor: 'pointer',
                  textDecorationColor: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                {task.prefix ? `${task.prefix} - ${task.tstype_name}` : task.tstype_name}:
                <Box>{task.name}</Box>
              </Link>
            </Box>
            {task.due_date && (
              <Box display="flex" flexDirection={'row'} gap={1}>
                <PendingActionsIcon fontSize="small" />
                <Typography variant="caption" noWrap>
                  {convertDate(task.due_date)}
                </Typography>
              </Box>
            )}
          </Box>
        }
      />
    </Card>
  );
};

export default TaskListItemNoneCard;
