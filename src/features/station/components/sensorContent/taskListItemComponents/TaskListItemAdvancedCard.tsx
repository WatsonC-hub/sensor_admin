import {EditOutlined, Person, Warning} from '@mui/icons-material';
import {Box, Typography, Card, CardHeader, CardContent, Button, Grid2} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import React, {useMemo, useState} from 'react';
import {useTasks} from '~/features/tasks/api/useTasks';
import {Task} from '~/features/tasks/types';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import {useTaskHistory} from '~/features/tasks/api/useTaskHistory';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {convertDate} from '~/helpers/dateConverter';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TaskForm from '~/features/tasks/components/TaskForm';
import {getColor} from '~/features/notifications/utils';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';

type Props = {
  task: Task;
};

const TaskListItemAdvancedCard = ({task}: Props) => {
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const {
    patch: updateTask,
    getUsers: {data: taskUsers},
    getStatus: {data: taskStatus},
  } = useTasks();

  const {setSelectedTask} = useTaskStore();

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

  const patchTaskAssignedTo = (assigned_to: string | null) => {
    const data = {
      ts_id: task.ts_id,
      assigned_to: assigned_to,
    };
    const payload = {
      path: task.id,
      data: data,
    };

    updateTask.mutate(payload);
  };

  const {
    get: {data: comments},
  } = useTaskHistory(task.id);

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

  const filteredComments = comments?.filter((comment) => 'display_name' in comment);
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
        <CardContent
          sx={{paddingBottom: 0, paddingX: 1, '&.MuiCardContent-root:last-child': {paddingY: 0}}}
        >
          <Grid2 container color="grey.700" spacing={1}>
            {(task.block_all || task.block_on_location) && (
              <Grid2 size={12} display={'flex'} flexDirection={'row'} gap={1} alignItems="center">
                <Warning fontSize="small" />
                <Typography
                  variant="caption"
                  fontSize={12}
                  display={'flex'}
                  flexDirection={'row'}
                  gap={0.5}
                  alignItems="center"
                >
                  Dæmper {task.block_all ? 'alle' : 'samme'} notifikationer på{' '}
                  {task.block_on_location ? 'lokationen' : 'tidsserien'}
                </Typography>
              </Grid2>
            )}
            <Grid2 size={6} display={'flex'} flexDirection={'row'} gap={1} alignItems="center">
              {task.can_edit ? (
                <>
                  <Person
                    sx={{
                      color: 'grey.700',
                    }}
                  />
                  <TaskForm.AssignedToSelect
                    onBlurCallback={(e) => {
                      if (typeof e === 'object' && 'value' in e.target) {
                        const user = taskUsers?.find((user) => user.id === e.target.value);
                        if (user !== undefined && task.assigned_to !== user.id)
                          patchTaskAssignedTo(user.id);
                      }
                    }}
                    placeholder="Vælg ansvarlig"
                    label=""
                    sx={{
                      p: 0,
                      size: 'small',
                      width: 150,
                      '& .MuiOutlinedInput-notchedOutline': {
                        fontSize: 'small',
                        borderRadius: 2.5,
                      },

                      '& .MuiOutlinedInput-root': {
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
                </>
              ) : (
                <Box display={'flex'} flexDirection={'row'} gap={0.5} pt={0.5} alignItems="center">
                  <Person fontSize="small" />
                  <Typography variant="caption">{task.assigned_display_name}</Typography>
                </Box>
              )}
            </Grid2>
            <Grid2 size={6} display={'flex'} flexDirection={'row'} gap={1} alignItems="center">
              <TaskForm.StatusSelect
                disabled={!task.can_edit}
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
                  p: 0,
                  '& .MuiOutlinedInput-notchedOutline': {
                    fontSize: 'small',
                    borderRadius: 2.5,
                  },

                  '& .MuiOutlinedInput-root': {
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
            </Grid2>
            <Grid2
              size={12}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'space-between'}
            >
              <Grid2 size={12} gap={1}>
                {task.description && (
                  <Box alignItems={'center'} display="flex" gap={1}>
                    <DescriptionIcon fontSize="small" />
                    <Typography variant="caption">{task.description}</Typography>
                  </Box>
                )}
              </Grid2>
              <Grid2 size={12}>
                {filteredComments && filteredComments.length > 0 && (
                  <Box display="flex" flexDirection={'row'} gap={1} pt={2} alignItems="start">
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <Box display="flex" flexDirection={'column'} alignItems={'start'} gap={0.5}>
                      {!showAllComments && (
                        <>
                          <Typography variant="caption">
                            {filteredComments?.[filteredComments.length - 1]?.comment}
                          </Typography>
                          {filteredComments.length > 1 && (
                            <Typography
                              sx={{textDecoration: 'underline', cursor: 'pointer'}}
                              variant="caption"
                              component="span"
                              onClick={() => setShowAllComments(true)}
                            >
                              Der er yderligere {filteredComments?.length - 1} kommentarer
                            </Typography>
                          )}
                        </>
                      )}
                      {showAllComments &&
                        filteredComments?.map((comment) => (
                          <Typography key={comment.id} variant="caption">
                            {comment.comment}
                          </Typography>
                        ))}
                    </Box>
                  </Box>
                )}
              </Grid2>
            </Grid2>
          </Grid2>
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

export default TaskListItemAdvancedCard;
