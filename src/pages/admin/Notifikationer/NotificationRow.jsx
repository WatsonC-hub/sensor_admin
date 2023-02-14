import {useState} from 'react';
import {Box, Typography, Button} from '@mui/material';
import {ErrorOutlineOutlined} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import moment from 'moment';
import TrelloModal from './TrelloModal';

const NotificationRow = ({notification, onPostpone, onIgnore, onSchedule}) => {
  const [open, setOpen] = useState(false);

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
        <Button
          onClick={() => setOpen(true)}
          variant="contained"
          color={notification.status === 'SCHEDULED' ? 'success' : 'warning'}
        >
          Skemalæg
        </Button>
        <Button
          onClick={onPostpone}
          variant="contained"
          color={notification.status === 'POSTPONED' ? 'success' : 'warning'}
        >
          Udskyd
        </Button>
        {notification.status === 'IGNORED' ? (
          <Button
            onClick={() => onIgnore(moment(notification.dato).format('YYYY-MM-DDTHH:mm:ss'))}
            variant="contained"
            color={notification.status === 'IGNORED' ? 'success' : 'warning'}
          >
            Afignorer
          </Button>
        ) : (
          <Button
            onClick={() => onIgnore(null)}
            variant="contained"
            color={notification.status === 'IGNORED' ? 'success' : 'warning'}
          >
            Ignorer
          </Button>
        )}
      </Box>
      <TrelloModal open={open} setOpen={setOpen} onSchedule={onSchedule} />
    </Box>
  );
};

export default NotificationRow;
