import {Grid, Typography} from '@mui/material';
import moment from 'moment';
import React from 'react';

import {TaskComment} from '~/features/tasks/types';

type Props = {
  comment: TaskComment;
};

const TaskInfoComment = ({comment}: Props) => {
  return (
    <Grid container key={comment.id} flexDirection={'row'}>
      <Grid
        item
        xs={12}
        alignSelf={'center'}
        sx={{backgroundColor: 'grey.300'}}
        border={1}
        borderRadius={2}
      >
        <Typography
          p={1}
          my={0.5}
          variant="body2"
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          borderBottom={1}
        >
          <b>{`${comment.display_name} `}</b>
          {moment(comment.created_at).format('YYYY-MM-DD HH:mm')}
        </Typography>
        <Typography
          py={1}
          ml={1}
          whiteSpace={'pre-line'}
          variant="body2"
          sx={{wordWrap: 'break-word'}}
        >
          {`${comment.comment}`}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default TaskInfoComment;
