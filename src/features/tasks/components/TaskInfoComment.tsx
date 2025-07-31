import {Box, Typography} from '@mui/material';
import React from 'react';

import {TaskComment} from '~/features/tasks/types';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';

type Props = {
  comment: TaskComment;
};

const TaskInfoComment = ({comment}: Props) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width={'100%'}
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
        {convertDateWithTimeStamp(comment.created_at)}
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
    </Box>
  );
};

export default TaskInfoComment;
