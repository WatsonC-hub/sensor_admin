import {Edit, Person} from '@mui/icons-material';
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
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {CalendarIcon} from '@mui/x-date-pickers';
import TaskForm from '~/features/tasks/components/TaskForm';

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
          backgroundColor: task.itinerary_id ? '#fef9f4' : undefined,
        }}
      >
        {task.itinerary_id === null && (
          <CardHeader
            sx={{
              width: '100%',
              backgroundColor: 'primary.main',
              color: 'white',
              py: 0.25,
              px: 2,
            }}
            title={
              <Box
                display="flex"
                flexDirection={'row'}
                alignItems="center"
                justifyContent={'space-between'}
              >
                <Typography variant="caption">{task.name}</Typography>
                <Box gap={1} display="flex" alignItems={'center'}>
                  <Person />
                  <TaskForm.AssignedToSelect
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
                      size: 'small',
                      width: 150,
                      '& .MuiSelect-select': {
                        padding: '4px !important',
                        pl: '14px !important',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white !important',
                        borderRadius: 2.5,
                      },
                      '& .MuiOutlinedInput-root': {
                        fontSize: 'small',
                        color: 'white',
                      },
                      '& .MuiSvgIcon-root': {
                        color: 'white',
                      },
                    }}
                  />
                </Box>
              </Box>
            }
          />
        )}
        <CardContent
          sx={{paddingBottom: 0, paddingX: 1, '&.MuiCardContent-root:last-child': {paddingY: 1}}}
        >
          <Grid2 container color="grey.700" spacing={1}>
            <Grid2
              size={7.5}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'space-between'}
              alignContent={task.itinerary_id ? 'start' : 'center'}
            >
              <Grid2 size={12} gap={1}>
                {task.itinerary_id === null ? (
                  <>
                    {task.description && (
                      <Box alignItems={'center'} display="flex" gap={1}>
                        <DescriptionIcon fontSize="small" />
                        <Typography variant="caption">{task.description}</Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box display="flex" flexDirection={'row'} gap={1} alignItems="center">
                    <AssignmentOutlinedIcon
                      sx={{color: 'grey.700', alignSelf: 'start'}}
                      fontSize="small"
                    />
                    <Box display="flex" flexDirection={'column'} width={'100%'} gap={0.5}>
                      <Typography variant="caption" color="grey.700">
                        {task.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="grey.700"
                        fontStyle={'italic'}
                        sx={{wordBreak: 'break-all'}}
                      >
                        {task.description}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Grid2>
              <Grid2 size={12} gap={1}>
                {task.itinerary_id === null && task.due_date && (
                  <Box display="flex" flexDirection={'row'} gap={1}>
                    <PendingActionsIcon fontSize="small" />
                    <Typography variant="caption">{convertDate(task.due_date)}</Typography>
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
            <Grid2
              size={4.5}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'space-between'}
            >
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
                  marginTop: 0.5,
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
              {filteredComments && filteredComments.length > 0 && (
                <Box
                  display="flex"
                  width={'100%'}
                  gap={0.5}
                  justifyContent={'center'}
                  alignItems="center"
                >
                  <CalendarIcon fontSize="small" />
                  <Typography variant="caption" fontSize={'0.6rem'}>
                    {convertDate(filteredComments[filteredComments.length - 1].created_at)}
                  </Typography>

                  <Typography variant="caption" fontSize={'0.6rem'}>
                    {' - '}
                  </Typography>
                  <Typography variant="caption" fontSize={'0.6rem'}>
                    {filteredComments[filteredComments.length - 1].display_name}
                  </Typography>
                </Box>
              )}
            </Grid2>
          </Grid2>

          <Box display="flex" flexDirection={'column'} alignItems="center" justifySelf={'flex-end'}>
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
          </Box>
        </CardContent>
      </Card>
    </TaskForm>
  );
};

export default TaskListItemAdvancedCard;
