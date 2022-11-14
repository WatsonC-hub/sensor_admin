import React from 'react';
import {Box, Typography} from '@mui/material';
import {ErrorOutlineOutlined} from '@mui/icons-material';

const NotificationRow = ({notification}) => {
  return (
    <Box
      key={notification.id}
      sx={{
        borderLeft: '2px dashed',
        borderLeftColor: 'primary.main',
        cursor: 'pointer',
      }}
      p={1}
      flexDirection="row"
      display="flex"
      onClick={() => {
        navigate(notification.navigateTo);
      }}
    >
      <ErrorOutlineOutlined sx={{color: notification.color}} />
      <Typography>{notification.opgave}</Typography>
      <Typography>{notification.dato}</Typography>
    </Box>
  );
};

export default NotificationRow;
