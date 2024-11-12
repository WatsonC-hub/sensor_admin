import {Grid, Typography, Box} from '@mui/material';
import moment from 'moment';
import React from 'react';

import {TaskComment} from '../types';

type Props = {
  comment: TaskComment;
};

const TaskInfoComment = ({comment}: Props) => {
  return (
    <Grid container key={comment.id} flexDirection={'row'} spacing={1}>
      <Grid item xs={'auto'}>
        <Typography variant="body2">{`${comment.initials}: `}</Typography>
      </Grid>
      <Grid item xs={7} alignSelf={'center'}>
        <Typography
          whiteSpace={'pre-line'}
          variant="body2"
          sx={{wordWrap: 'break-word'}}
        >{`${comment.comment}`}</Typography>
      </Grid>
      <Grid item xs={'auto'} alignSelf={'center'}>
        <Box display={'flex'} flexDirection={'row'} justifySelf={'center'} gap={1}>
          <Typography variant="body2">
            {moment(comment.created_at).format('YYYY-MM-DD HH:mm')}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default TaskInfoComment;
