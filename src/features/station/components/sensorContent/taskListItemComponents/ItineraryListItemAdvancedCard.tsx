import {EditOutlined} from '@mui/icons-material';
import {Box, Typography, Button, Grid2} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import React, {useMemo, useState} from 'react';
import {useTasks} from '~/features/tasks/api/useTasks';
import {Task} from '~/features/tasks/types';
import {useTaskHistory} from '~/features/tasks/api/useTaskHistory';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import TaskForm from '~/features/tasks/components/TaskForm';
type Props = {
  task: Task;
};

const ItineraryListItemAdvancedCard = ({task}: Props) => {
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const {
    patch: updateTask,
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
      <Box>
        <Grid2 container color="grey.700" spacing={0.5}>
          <Grid2
            size={8}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
          >
            <Grid2 size={12} gap={1}>
              {task.description && (
                <>
                  <Box display="flex" gap={1}>
                    <DescriptionIcon fontSize="small" />
                    <Box display="flex" flexDirection={'column'} gap={0}>
                      <Typography variant="caption" fontWeight="bold">
                        {task.name}
                      </Typography>
                      <Typography variant="caption">{task.description}</Typography>
                    </Box>
                  </Box>
                </>
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
          <Grid2 size={4} display={'flex'} flexDirection={'row'} gap={1}>
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
                p: 0,
                '& .MuiOutlinedInput-notchedOutline': {
                  fontSize: 'small',
                  borderRadius: 2.5,
                },

                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2.5,
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
      </Box>
    </TaskForm>
  );
};

export default ItineraryListItemAdvancedCard;
