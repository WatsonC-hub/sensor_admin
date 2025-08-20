import {Box, Button, Card, CardContent, Typography} from '@mui/material';
import React from 'react';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {Task} from '~/features/tasks/types';
import {Person} from '@mui/icons-material';
import {CalendarIcon} from '@mui/x-date-pickers';
import {convertDate} from '~/helpers/dateConverter';
import {useDisplayState} from '~/hooks/ui';

type Props = {
  task: Task;
};

const TaskHistoryCard = ({task}: Props) => {
  const setSelectedTask = useDisplayState((state) => state.setSelectedTask);

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        pl: 0.5,
      }}
      variant="elevation"
    >
      <CardContent
        sx={{
          display: 'flex',
          p: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          '&:last-child': {
            pb: 0,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexGrow: 1,
          }}
        >
          <Box display={'flex'} gap={1} alignItems={'center'}>
            <CalendarIcon fontSize="small" sx={{color: 'grey.700'}} />
            {task?.due_date && (
              <Typography variant="caption" color="grey.700">
                {convertDate(task.due_date)}
              </Typography>
            )}
          </Box>
          <Box display="flex" gap={1} alignItems="center" color="grey.700">
            <Box display="flex" alignItems="center" sx={{height: '100%', m: 0, py: 1, px: 1}}>
              <AssignmentOutlinedIcon
                fontSize="small"
                sx={{
                  color: task.status_id != 1 || task.is_created ? 'gray' : 'white',
                }}
              />
            </Box>
            <Typography variant="caption">{task.name}</Typography>
          </Box>
          <Box display="flex" alignItems="center" pr={1}>
            <Person
              sx={{
                color: 'grey.700',
              }}
              fontSize="small"
            />
            <Typography variant="caption" color="grey.700">
              {task.assigned_display_name}
            </Typography>
          </Box>
        </Box>
        <Box display={'flex'} alignItems="center" width={'fit-content'}>
          <Button
            size="small"
            onClick={() => {
              setSelectedTask(task.id);
            }}
            sx={{textTransform: 'initial', borderRadius: 2.5}}
          >
            Se historik
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskHistoryCard;
