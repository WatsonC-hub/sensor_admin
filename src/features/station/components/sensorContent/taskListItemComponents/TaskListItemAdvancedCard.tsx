import {EditOutlined, Person, Warning} from '@mui/icons-material';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
  Grid2,
  TextField,
  Link,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import React, {useMemo, useState} from 'react';
import {useTaskMutations, useTaskStatus, useTaskUsers} from '~/features/tasks/api/useTasks';
import {Task} from '~/features/tasks/types';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import {useTaskHistory} from '~/features/tasks/api/useTaskHistory';
import {convertDate} from '~/helpers/dateConverter';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TaskForm from '~/features/tasks/components/TaskForm';
import {getColor} from '~/features/notifications/utils';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useDisplayState} from '~/hooks/ui';
import {useUser} from '~/features/auth/useUser';
import dayjs from 'dayjs';
import {FlagEnum, sensorColors} from '~/features/notifications/consts';

type Props = {
  task: Task;
  showLocationLink?: boolean;
};

const TaskListItemAdvancedCard = ({task, showLocationLink}: Props) => {
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const {location, station} = useNavigationFunctions();
  const {superUser} = useUser();
  const {patch: updateTask} = useTaskMutations();
  const {data: taskStatus} = useTaskStatus();
  const {data: taskUsers} = useTaskUsers();

  const [selectedTask, setSelectedTask] = useDisplayState((state) => [
    state.selectedTask,
    state.setSelectedTask,
  ]);

  const patchTaskStatus = (status_id: number) => {
    const data = {
      ts_id: task.ts_id,
      status_id: status_id,
    };
    const payload = {
      path: task.id,
      data: data,
    };

    updateTask.mutate(payload, {
      onSuccess: () => {
        if ((status_id === 3 || status_id === 34) && selectedTask === task.id)
          setSelectedTask(null);
      },
    });
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

  const {data: comments} = useTaskHistory(task.id);

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
            px: 1,
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
                  <Box display="flex" flexDirection={'row'} flexWrap={'wrap'} gap={0.5}>
                    <Link
                      onClick={() =>
                        showLocationLink ? location(task.loc_id) : station(task.ts_id)
                      }
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
                      {!showLocationLink
                        ? `${task.prefix ? `${task.prefix} - ${task.tstype_name}` : task.tstype_name}:`
                        : ''}
                      <Box>{showLocationLink ? task.location_name : task.name}</Box>
                    </Link>
                    {showLocationLink && (
                      <Box>
                        <Typography variant="caption">
                          {task.tstype_name} - {task.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {!task.is_created && task.sla && superUser && (
                    <Typography
                      mt={-0.5}
                      fontStyle={'italic'}
                      fontWeight={'bold'}
                      variant={'caption'}
                    >
                      Løsningsfrist: {task.sla.format('l')}
                    </Typography>
                  )}
                </Box>
              </Box>
              {task.due_date && (
                <Box display="flex" flexDirection={'row'} gap={1} alignItems={'center'}>
                  <PendingActionsIcon
                    fontSize="small"
                    sx={{
                      color: dayjs(task.due_date).isBefore(dayjs(), 'day')
                        ? sensorColors[FlagEnum.WARNING].color
                        : 'white',
                    }}
                  />
                  <Typography variant="caption" noWrap>
                    {convertDate(task.due_date)}
                  </Typography>
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
            {task.can_edit ? (
              <Grid2 container size={6}>
                <Grid2 size={2} alignItems={'center'} display={'flex'}>
                  <Person
                    sx={{
                      color: 'grey.700',
                    }}
                  />
                </Grid2>
                <Grid2 size={10}>
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
                      '& .MuiOutlinedInput-notchedOutline': {
                        fontSize: 'small',
                        borderRadius: 2.5,
                      },

                      '& .MuiOutlinedInput-root': {
                        fontSize: 'small',
                      },
                      '& .MuiSelect-select': {
                        padding: '4px !important',
                        pl: '14px !important',
                      },
                    }}
                  />
                </Grid2>
              </Grid2>
            ) : (
              <Grid2 size={6}>
                <Box display={'flex'} flexDirection={'row'} gap={0.5} pt={0.5} alignItems="center">
                  <Person />
                  <TextField
                    value={task.assigned_display_name ?? ''}
                    disabled
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': {
                        padding: '4px !important',
                        fontSize: 'small',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                      },
                    }}
                  />
                </Box>
              </Grid2>
            )}
            <Grid2 size={6}>
              {task.can_edit ? (
                <TaskForm.StatusSelect
                  disableClosedStatus={!task.is_created}
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
              ) : (
                <Box pt={0.5} alignItems="center">
                  <TextField
                    value={task.status_name}
                    disabled
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': {
                        padding: '4px !important',
                        fontSize: 'small',
                        borderRadius: 2.5,
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                      },
                    }}
                  />
                </Box>
              )}
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

export default TaskListItemAdvancedCard;
