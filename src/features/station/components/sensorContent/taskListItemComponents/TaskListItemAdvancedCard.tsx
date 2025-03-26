import {Edit, Person} from '@mui/icons-material';
import {Box, Typography, Card, CardHeader, CardContent, Button} from '@mui/material';
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
      name: task.name,
      description: task.description,
      status_id: task.status_id,
      due_date: task.due_date,
      assigned_to: task.assigned_to,
      loctypename: task.loctypename,
      tstype_name: task.tstype_name,
      projectno: task.projectno,
      project_text: task.project_text,
      location_name: task.location_name,
      blocks_notifications:
        task.blocks_notifications && task.blocks_notifications.length !== 0
          ? task.blocks_notifications.length === 1
            ? task.blocks_notifications
            : ('alle' as const)
          : undefined,
      block_on_location: task.block_on_location ? 'true' : 'false',
      block_all: task.block_all ? 'true' : 'false',
    };
  }, [task]);

  const textfieldProps = {
    placeholder: 'Vælg ansvarlig',
    label: '',
    // slotProps: {InputLabel: {disabled: true}},
    sx: {
      color: 'white',
      fontSize: 'small',
      width: 150,
      '& .MuiOutlinedInput-root, .MuiAutocomplete-popupIndicator, .MuiAutocomplete-clearIndicator':
        {
          fontSize: 'small',
          color: 'white',
          borderRadius: 2.5,
          '& .Mui-focused': {
            color: 'white',
          },
        },
      '& .MuiOutlinedInput-root': {
        borderRadius: 2.5,
        color: 'white',
        border: '1px solid',
        padding: '4px !important',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white !important',
        py: 0,
        m: -0.15,
      },
    },
  };

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
              py: 1,
              px: 2,
            }}
            title={
              <Box
                display="flex"
                flexDirection={'row'}
                gap={1}
                alignItems="center"
                justifyContent={'space-between'}
              >
                <Typography variant="caption">{task.name}</Typography>
                <Box gap={1} display="flex" alignItems={'center'}>
                  <Person />
                  <TaskForm.AssignedTo
                    onBlur={({target}) => {
                      if ('value' in target) {
                        const user = taskUsers?.find((user) => user.display_name === target.value);
                        if (user !== undefined && task.assigned_to !== user.id)
                          patchTaskAssignedTo(user.id);
                      }
                    }}
                    textFieldsProps={textfieldProps}
                  />
                </Box>
              </Box>
            }
          />
        )}
        <CardContent
          sx={{paddingBottom: 0, paddingX: 1, '&.MuiCardContent-root:last-child': {paddingY: 1.5}}}
        >
          <Box
            display="flex"
            gap={1}
            flexDirection={'column'}
            justifyContent={'space-around'}
            color="grey.700"
          >
            <Box display="flex" gap={1} alignContent="center">
              <Box
                display="flex"
                flexDirection={'row'}
                width={'60%'}
                gap={1}
                alignItems={task.itinerary_id ? 'start' : 'center'}
              >
                {task.itinerary_id === null ? (
                  <>
                    <DescriptionIcon fontSize="small" />
                    <Typography variant="caption" sx={{wordBreak: 'break-all'}} width={'100%'}>
                      {task.description}
                    </Typography>
                  </>
                ) : (
                  <>
                    <AssignmentOutlinedIcon sx={{color: 'grey.700'}} fontSize="small" />
                    <Box display="flex" flexDirection={'column'} width={'100%'} gap={0.5}>
                      <Typography variant="caption" color="grey.700">
                        {task.name}
                      </Typography>
                      <Typography variant="caption" color="grey.700" sx={{wordBreak: 'break-all'}}>
                        {task.description}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
              <Box display="flex" gap={1} width={'40%'}>
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
                    size: 'small',
                    '& .MuiSelect-outlined, .MuiOutlinedInput-root, .MuiOutlinedInput-root, &:hover .MuiOutlinedInput-notchedOutline':
                      {
                        fontSize: 'small',
                        borderRadius: 2.5,
                      },

                    '& .MuiOutlinedInput-root': {
                      backgroundColor: task.itinerary_id ? 'white' : '',
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: 'small',
                      backgroundColor: 'white',
                      transform: 'translate(10px, -9px) scale(0.9)',
                    },
                  }}
                />
              </Box>
            </Box>
            {task.itinerary_id === null && (
              <Box display="flex" gap={1} alignItems="center">
                <PendingActionsIcon fontSize="small" />
                <Typography variant="caption">
                  {task.due_date && convertDate(task.due_date)}
                </Typography>
              </Box>
            )}
            {filteredComments && filteredComments.length > 0 && (
              <Box display="flex" flexDirection={'row'} gap={1} alignItems="center">
                <ChatBubbleOutlineIcon fontSize="small" />
                <Box display="flex" flexDirection={'column'} width={'55%'} gap={0.5}>
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
                <Box
                  display="flex"
                  flexDirection={'row'}
                  width={'45%'}
                  gap={0.5}
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
              </Box>
            )}
          </Box>
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
          {/* <Box
              display="flex"
              flexDirection={'column'}
              gap={1}
              justifyContent={'space-between'}
            ></Box> */}
        </CardContent>
      </Card>
    </TaskForm>
  );
};

export default TaskListItemAdvancedCard;
