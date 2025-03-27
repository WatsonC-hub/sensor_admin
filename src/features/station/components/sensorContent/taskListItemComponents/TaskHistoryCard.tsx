import {Box, Card, Typography} from '@mui/material';
import React from 'react';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import {Task} from '~/features/tasks/types';
import {Person} from '@mui/icons-material';
import {CalendarIcon} from '@mui/x-date-pickers';
import {convertDate} from '~/helpers/dateConverter';

type Props = {
  task: Task;
};

const TaskHistoryCard = ({task}: Props) => {
  return (
    <Card
      sx={{
        borderRadius: 2.5,
        display: 'flex',
        // padding: 1,
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
        // opacity: task.itinerary_id ? 0.7 : 1,
        px: 0.5,
      }}
      variant="elevation"
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
    </Card>
  );
};

export default TaskHistoryCard;
