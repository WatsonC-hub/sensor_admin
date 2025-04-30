import {Box, Button, Card, CardContent, CardHeader, Typography} from '@mui/material';
import React, {useMemo} from 'react';
import {Task} from '~/features/tasks/types';
import {EditOutlined} from '@mui/icons-material';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {getColor} from '~/features/notifications/utils';
import TaskForm from '~/features/tasks/components/TaskForm';
import {convertDate} from '~/helpers/dateConverter';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';

type Props = {
  task: Task;
};

const TaskListItemSimpleCard = ({task}: Props) => {
  const {setSelectedTask} = useTaskStore();

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
          backgroundColor: task.itinerary_id ? '#fef9f4' : undefined,
        }}
      >
        {task.itinerary_id === null && (
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
                  <Typography variant="caption">{task.name}</Typography>
                </Box>
                {task.due_date && (
                  <Box display="flex" flexDirection={'row'} gap={1}>
                    <PendingActionsIcon fontSize="small" />
                    <Typography variant="caption">{convertDate(task.due_date)}</Typography>
                  </Box>
                )}
              </Box>
            }
          />
        )}
        <CardContent
          sx={{paddingBottom: 0, paddingX: 1, '&.MuiCardContent-root:last-child': {paddingY: 1}}}
        >
          <Box display={'flex'} flexDirection={'row'} alignItems="center" justifyContent="end">
            <EditOutlined
              fontSize="small"
              sx={{
                color: 'grey.700',
              }}
            />
            <Button
              variant="text"
              size="small"
              onClick={() => setSelectedTask(task.id)}
              sx={{textTransform: 'initial', borderRadius: 2.5}}
            >
              Rediger opgave
            </Button>
          </Box>
          {/* <Box display="flex" flexDirection={'column'} alignItems="center" justifySelf={'flex-end'}>
            <Box
              display="flex"
              flexDirection={'row'}
              alignItems="center"
              gap={0.5}
              color="primary.main"
            >
              <Edit fontSize="small" />
              <Button
                variant="text"
                size="small"
                onClick={() => setSelectedTask(task.id)}
                sx={{textTransform: 'initial', borderRadius: 2.5}}
              >
                Rediger opgave
              </Button>
            </Box>
          </Box> */}
        </CardContent>
      </Card>
    </TaskForm>
  );
};

export default TaskListItemSimpleCard;
