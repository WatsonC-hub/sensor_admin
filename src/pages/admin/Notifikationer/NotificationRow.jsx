import {useState} from 'react';
import {Box, Typography, Button} from '@mui/material';
import {ErrorOutlineOutlined} from '@mui/icons-material';
import {useNavigate} from 'react-router-dom';
import moment from 'moment';
import TrelloModal from './TrelloModal';
import PostponeModal from './PostponeModal';
import useBreakpoints from 'src/hooks/useBreakpoints';

const NotificationRow = ({notification, onPostpone, onIgnore, onSchedule}) => {
  const [trelloOpen, setTrelloOpen] = useState(false);
  const [postponeOpen, setPostponeOpen] = useState(false);

  const {isTouch} = useBreakpoints();

  const navigate = useNavigate();
  return (
    <>
      <Box
        key={notification.id}
        sx={{
          borderLeft: '2px dashed',
          borderLeftColor: 'primary.main',
          cursor: 'pointer',
        }}
        p={1}
        flexDirection={isTouch ? 'column' : 'row'}
        display="flex"
        justifyContent={'space-between'}
        maxWidth="80%"
        // border="1px dashed"
      >
        <Box
          onClick={() => {
            navigate(notification.navigateTo);
          }}
        >
          <ErrorOutlineOutlined sx={{color: notification.color}} />
          <Typography>{notification.opgave}</Typography>
          <Typography>
            {moment(notification.dato).isValid() &&
              moment(notification.dato).format('DD-MM-YYYY HH:mm')}
          </Typography>
        </Box>
        <Box gap={1} display="inline-flex" height="40px">
          <Button
            onClick={() => setTrelloOpen(true)}
            variant="contained"
            color={notification.status === 'SCHEDULED' ? 'success' : 'warning'}
          >
            Skemalæg
          </Button>
          <Button
            onClick={() => setPostponeOpen(true)}
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
      </Box>
      <TrelloModal open={trelloOpen} setOpen={setTrelloOpen} onSchedule={onSchedule} />
      <PostponeModal open={postponeOpen} setOpen={setPostponeOpen} onPostpone={onPostpone} />
    </>
  );
};

export default NotificationRow;
