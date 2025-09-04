import {Box, Button, Card, CardContent, CardHeader, Link, Typography} from '@mui/material';
import React, {useMemo} from 'react';
import {Task} from '~/features/tasks/types';
import {EditOutlined} from '@mui/icons-material';
import {getColor} from '~/features/notifications/utils';
import TaskForm from '~/features/tasks/components/TaskForm';
import {convertDate} from '~/helpers/dateConverter';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useDisplayState} from '~/hooks/ui';

type Props = {
  task: Task;
};

const TaskListItemSimpleCard = ({task}: Props) => {
  const setSelectedTask = useDisplayState((state) => state.setSelectedTask);
  const {station} = useNavigationFunctions();
  const defaultValues = useMemo(() => {
    if (!task) return;
    return {
      status_id: task.status_id,
      assigned_to: task.assigned_to,
    };
  }, [task]);

  const color = getColor({
    flag: task.flag,
    has_task: task.is_created,
    due_date: task.due_date,
  });

  const isCreated = task.is_created;

  return (
    <TaskForm key={task.id} onSubmit={() => {}} defaultValues={defaultValues}>
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
              <Box
                display={'flex'}
                flexDirection={'row'}
                gap={0.5}
                alignItems="center"
                fontSize={14}
              >
                <NotificationIcon
                  iconDetails={{
                    notification_id: task.blocks_notifications[0],
                    flag: task.is_created ? null : task.flag,
                    has_task: task.is_created,
                    due_date: task.due_date,
                  }}
                  noCircle={true}
                />
                <Box display="flex" flexDirection={'column'}>
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
                  {task.sla && (
                    <Typography
                      mt={-0.5}
                      fontStyle={'italic'}
                      fontWeight={'bold'}
                      variant={'caption'}
                    >
                      SLA frist: {task.sla.format('l')}
                    </Typography>
                  )}
                </Box>
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
        <CardContent
          sx={{paddingBottom: 0, paddingX: 1, '&.MuiCardContent-root:last-child': {paddingY: 1}}}
        >
          <Box display={'flex'} flexDirection={'row'} alignItems="center" justifyContent="end">
            {task.can_edit && (
              <EditOutlined
                fontSize="small"
                sx={{
                  color: 'grey.700',
                }}
              />
            )}
            <Button
              variant="text"
              size="small"
              onClick={() => setSelectedTask(task.id)}
              sx={{textTransform: 'initial', borderRadius: 2.5}}
            >
              {task.can_edit ? 'Rediger opgave' : 'Se opgave'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </TaskForm>
  );
};

export default TaskListItemSimpleCard;
