import {Grid, Typography, Box} from '@mui/material';
import moment from 'moment';
import React from 'react';

import {TaskChanges} from '../types';

type Props = {
  taskChanges: TaskChanges;
};

const TaskInfoChanges = ({taskChanges}: Props) => {
  return (
    <Grid container key={taskChanges.id} flexDirection={'row'} spacing={1}>
      <Grid item xs={'auto'}>
        <Typography variant="body2">{`${taskChanges.initials}: `}</Typography>
      </Grid>
      <Grid item xs={7} alignSelf={'center'}>
        <Typography
          whiteSpace={'pre-line'}
          variant="body2"
          sx={{wordWrap: 'break-word'}}
        >{`${taskChanges.field_name} ændret fra ${taskChanges.old_value} til ${taskChanges.new_value}`}</Typography>
      </Grid>
      <Grid item xs={'auto'} alignSelf={'center'}>
        <Box display={'flex'} flexDirection={'row'} justifySelf={'center'} gap={1}>
          <Typography variant="body2">
            {moment(taskChanges.created_at).format('YYYY-MM-DD HH:mm')}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default TaskInfoChanges;
