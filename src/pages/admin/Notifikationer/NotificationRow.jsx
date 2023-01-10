import React from 'react';
import {Box, Typography, Button} from '@mui/material';
import {ErrorOutlineOutlined} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';

const NotificationRow = ({notification, onPostpone}) => {
  const navigate = useNavigate();
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
    >
      <Box
        onClick={() => {
          navigate(notification.navigateTo);
        }}
      >
        <ErrorOutlineOutlined sx={{color: notification.color}} />
        <Typography>{notification.opgave}</Typography>
        <Typography>{notification.dato}</Typography>
      </Box>
      <Box>
        <Button onClick={onPostpone} variant="contained" color="secondary">
          Udskyd
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationRow;
