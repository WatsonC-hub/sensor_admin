import {ErrorOutlineOutlined} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  Avatar,
  Badge,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuItem as SelectMenuItem,
  TextField,
} from '@mui/material';
import {groupBy, map, maxBy, sortBy} from 'lodash';
import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useNotificationOverview} from '../hooks/query/useNotificationOverview';
import {useTaskMutation} from '../hooks/query/useTaskMutation';
import Button from '~/components/Button';

// Mock data for notifications
const CHARACTERLIMIT = 60;
const NotificationList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [urgency, setUrgency] = useState('');
  const [description, setDescription] = useState('');

  const {post: createTask, markAsDone} = useTaskMutation();
  const params = useParams();

  const {data, isLoading} = useNotificationOverview();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openModal = () => {
    setModalOpen(true);
    handleClose();
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleUrgencyChange = (event) => {
    setUrgency(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleRegisterNotification = () => {
    console.log('Urgency:', urgency);
    console.log('Description:', description);
    createTask.mutate({
      path: params.ts_id,
      data: {
        opgave: description,
        flag: Number(urgency),
      },
    });
    closeModal();
  };

  const handleMarkAsDone = (notification) => {
    markAsDone.mutate({
      path: params.ts_id,
      data: {
        opgave: notification.opgave,
      },
    });
  };

  const onstation = data?.filter((elem) => elem.stationid == params.ts_id && elem.opgave != null);
  const manual_tasks = onstation?.filter((elem) => elem.notification_id == 0);
  const grouped = groupBy(
    onstation?.filter((elem) => elem.notification_id != 0),
    'notification_id'
  );

  const mapped = map(grouped, (group) => {
    return maxBy(group, (item) => (item.dato ? new Date(item.dato) : Number.NEGATIVE_INFINITY));
  });
  const concat = mapped?.concat(manual_tasks ?? []);
  const notifications = sortBy(concat, (item) => item.dato).reverse();

  // Find index of max flag in notificaitons
  const maxFlagIndex = notifications?.reduce(
    (iMax, x, i, arr) => (x.flag > arr[iMax].flag ? i : iMax),
    0
  );
  const badgeColor = notifications?.[maxFlagIndex]?.color;

  return (
    <div>
      <IconButton
        aria-label="Show Notifications"
        aria-controls="notifications-menu"
        aria-haspopup="menu"
        color="inherit"
        onClick={handleClick}
      >
        <Badge
          badgeContent={notifications?.length}
          sx={{
            '& .MuiBadge-badge': {
              color: 'grey.800',
              backgroundColor: badgeColor,
            },
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
        disableScrollLock
      >
        <MenuItem key="0" onClick={openModal} sx={{gap: 0.5}}>
          <ListItemIcon>
            <Avatar sx={{bgcolor: 'primary'}}>
              <AddIcon fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <ListItemText primary="Registrer opgave" />
        </MenuItem>
        {isLoading && <MenuItem>Indlæster...</MenuItem>}
        {notifications?.map((notification, index) => (
          <MenuItem
            key={index}
            onClick={handleClose}
            sx={{gap: 0.5, pointerEvents: notification.notification_id == 0 ? 'none' : 'none'}}
          >
            <ListItemIcon>
              <Avatar>
                <NotificationsIcon
                  //   fontSize="small"
                  sx={{
                    color: notification.color,
                  }}
                />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={notification.opgave}
              secondary={notification.dato.slice(0, 10)}
            />
            {/* <Typography variant="caption">{}</Typography> */}
            {notification.notification_id == 0 && (
              <IconButton
                sx={{
                  pointerEvents: 'auto',
                }}
                aria-label="Mark as done"
                onClick={() => handleMarkAsDone(notification)}
              >
                <DoneIcon />
              </IconButton>
            )}
          </MenuItem>
        ))}
      </Menu>
      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogTitle>Registrer opgave</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <TextField
            value={urgency}
            onChange={handleUrgencyChange}
            select
            label="Niveau"
            variant="outlined"
            fullWidth
            margin="dense"
          >
            <SelectMenuItem value="3">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <ErrorOutlineOutlined
                  sx={{
                    color: '#d32f2f',
                  }}
                />
                Kritisk
              </Box>
            </SelectMenuItem>
            <SelectMenuItem value="2">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <ErrorOutlineOutlined
                  sx={{
                    color: '#FF6C00',
                  }}
                />
                Middel
              </Box>
            </SelectMenuItem>
            <SelectMenuItem value="1">
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <ErrorOutlineOutlined
                  sx={{
                    color: '#ffb13f',
                  }}
                />
                Lav
              </Box>
            </SelectMenuItem>
          </TextField>

          <TextField
            label="Beskrivelse"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={handleDescriptionChange}
            inputProps={{maxLength: CHARACTERLIMIT}}
            helperText={`${description.length}/${CHARACTERLIMIT}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} btType="tertiary">
            Annuller
          </Button>
          <Button
            onClick={handleRegisterNotification}
            btType="primary"
            disabled={urgency == '' || description.length < 10}
          >
            Registrer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NotificationList;
