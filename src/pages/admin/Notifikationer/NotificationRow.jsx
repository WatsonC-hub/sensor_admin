import React from 'react';
import {Box, Typography, Button} from '@mui/material';
import {ErrorOutlineOutlined} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';

const NotificationRow = ({notification, onPostpone, onIgnore, onSchedule}) => {
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
      justifyContent={'space-between'}
      maxWidth="80%"
      border="1px dashed"
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
      <Box gap={2} display="inline-flex" height="40px" flexWrap="wrap">
        <Button onClick={onSchedule} variant="contained" color="secondary">
          Skemalæg
        </Button>
        <Button onClick={onPostpone} variant="contained" color="secondary">
          Udskyd
        </Button>
        {notification.status === 'IGNORED' ? (
          <Button onClick={onIgnore} variant="contained" color="secondary">
            Afignorer
          </Button>
        ) : (
          <Button onClick={onIgnore} variant="contained" color="secondary">
            Ignorer
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default NotificationRow;
