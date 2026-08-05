import {Box, Button, Grid, Link} from '@mui/material';
import React, {useMemo} from 'react';
import type {Task} from '~/features/tasks/types';
import {EditOutlined} from '@mui/icons-material';
import TaskForm from '~/features/tasks/components/TaskForm';

import DescriptionIcon from '@mui/icons-material/Description';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useDisplayState} from '~/hooks/ui';

type Props = {
  task: Task;
};

const ItineraryListItemSimpleCard = ({task}: Props) => {
  const setSelectedTask = useDisplayState((state) => state.setSelectedTask);
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
      <Grid
        container
        spacing={0.5}
        sx={{
          color: 'grey.700',
          width: '100%',
        }}
      >
        <Grid
          size={6}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {task.name && (
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                gap: 1,
              }}
            >
              <DescriptionIcon fontSize="small" />
              <Link
                onClick={() => station(task.ts_id)}
                color="inherit"
                variant="caption"
                underline="always"
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  cursor: 'pointer',
                  textDecorationColor: 'rgba(97, 97, 97, 0.6)',
                }}
              >
                {task.prefix ? `${task.prefix} - ${task.tstype_name}` : task.tstype_name}:
                <Box>{task.name}</Box>
              </Link>
            </Box>
          )}
        </Grid>
        <Grid
          size={6}
          sx={{
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'end',
            }}
          >
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
        </Grid>
      </Grid>
    </TaskForm>
  );
};

export default ItineraryListItemSimpleCard;
