import {Box, Typography} from '@mui/material';
import React from 'react';

import type {TaskComment} from '~/features/tasks/types';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';

type Props = {
  comment: TaskComment;
};

const TaskInfoComment = ({comment}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignSelf: 'center',
        border: 1,
        borderRadius: 2,
        backgroundColor: 'grey.300',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          p: 1,
          my: 0.5,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderBottom: 1,
        }}
      >
        <b>{`${comment.display_name} `}</b>
        {convertDateWithTimeStamp(comment.created_at)}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          py: 1,
          ml: 1,
          whiteSpace: 'pre-line',
          wordWrap: 'break-word',
        }}
      >
        {`${comment.comment}`}
      </Typography>
    </Box>
  );
};

export default TaskInfoComment;
