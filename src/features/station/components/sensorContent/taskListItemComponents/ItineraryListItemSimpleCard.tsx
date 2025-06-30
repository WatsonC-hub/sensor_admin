import {Box, Button, Grid2, Link} from '@mui/material';
import React, {useMemo} from 'react';
import {Task} from '~/features/tasks/types';
import {EditOutlined} from '@mui/icons-material';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import TaskForm from '~/features/tasks/components/TaskForm';

import DescriptionIcon from '@mui/icons-material/Description';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type Props = {
  task: Task;
};

const ItineraryListItemSimpleCard = ({task}: Props) => {
  const {setSelectedTask} = useTaskStore();
  const {station} = useNavigationFunctions();
  const defaultValues = useMemo(() => {
    if (!task) return;
    return {
      status_id: task.status_id,
      assigned_to: task.assigned_to,
    };
  }, [task]);

  return (
    <TaskForm key={task.id} onSubmit={() => {}} defaultValues={defaultValues}>
      <Grid2 container color="grey.700" spacing={0.5} width={'100%'}>
        <Grid2 size={6} display={'flex'} flexDirection={'row'} alignItems="center">
          {task.name && (
            <Box alignItems={'center'} display="flex" gap={1}>
              <DescriptionIcon fontSize="small" />
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
                  textDecorationColor: 'rgba(97, 97, 97, 0.6)',
                }}
              >
                {task.prefix ? `${task.prefix} - ${task.tstype_name}` : task.tstype_name}:
                <Box>{task.name}</Box>
              </Link>
            </Box>
          )}
        </Grid2>
        <Grid2 size={6} gap={1}>
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
        </Grid2>
      </Grid2>
    </TaskForm>
  );
};

export default ItineraryListItemSimpleCard;
