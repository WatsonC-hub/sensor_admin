import {Assignment, Edit} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DoneIcon from '@mui/icons-material/Done';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {Avatar, Badge, IconButton, ListItemIcon, ListItemText, Menu, MenuItem} from '@mui/material';
import {groupBy, map, maxBy, sortBy} from 'lodash';
import React, {useState} from 'react';
import {useParams} from 'react-router-dom';

import CreateManualTaskModal from '~/components/CreateManuelTaskModal';
import UpdateNotificationModal from '~/components/UpdateNotificationModal';
import {useNotificationOverview} from '~/hooks/query/useNotificationOverview';
import {useTasks} from '~/hooks/query/useTasks';
import NotificationIcon, {getColor} from '~/pages/field/overview/components/NotificationIcon';

// Mock data for notifications
const NotificationList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const {
    get: {data: tasks},
    markAsDone,
  } = useTasks();
  const params = useParams();

  const {data, isPending} = useNotificationOverview();

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

  const openUpdateModal = () => {
    setUpdateModalOpen(true);
    handleClose();
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
  };

  const handleMarkAsDone = (notification) => {
    markAsDone.mutate({
      path: params.ts_id,
      data: {
        opgave: notification.opgave,
      },
    });
  };

  let loc_id = params.locid;
  if (loc_id == undefined) {
    loc_id = data.filter((elem) => elem.ts_id == params.ts_id)[0]?.loc_id;
  }

  const onstation = data?.filter((elem) => elem.loc_id == loc_id && elem.opgave != null);
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

  const badgeColor = getColor(notifications[maxFlagIndex]);

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
          anchorOrigin={{vertical: 'top', horizontal: 'right'}}
          sx={{
            '& .MuiBadge-badge': {
              // color: 'grey.800',
              backgroundColor: badgeColor,
            },
          }}
        >
          {' '}
          <Badge
            badgeContent={tasks?.length}
            anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            sx={{
              '& .MuiBadge-badge': {
                // color: 'grey.800',
                backgroundColor: '#1798e9',
              },
            }}
          >
            <NotificationsIcon />
          </Badge>
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
        {isPending && <MenuItem>Indlæser...</MenuItem>}
        {notifications?.map((notification, index) => {
          const splitted = notification.ts_name.split(notification.loc_name);
          return (
            <MenuItem key={index} sx={{gap: 0.5}}>
              <ListItemIcon
                sx={{
                  fontSize: '1.5rem',
                }}
              >
                <NotificationIcon iconDetails={notification} />
              </ListItemIcon>
              <ListItemText
                primary={notification.opgave}
                secondary={
                  splitted[splitted.length - 1].replace('-', '').trim() +
                  ' - ' +
                  notification.dato.slice(0, 10)
                }
              />
              {/* <Typography variant="caption">{}</Typography> */}
              {/* {notification.notification_id == 0 && (
                <IconButton
                  sx={{
                    pointerEvents: 'auto',
                  }}
                  aria-label="Mark as done"
                  onClick={() => handleMarkAsDone(notification)}
                >
                  <DoneIcon />
                </IconButton>
              )} */}
              <IconButton
                sx={{
                  pointerEvents: 'auto',
                }}
                aria-label="Edit task"
                onClick={() => {
                  setSelectedNotification(notification);
                  openUpdateModal();
                }}
              >
                <Edit />
              </IconButton>
            </MenuItem>
          );
        })}
        {tasks?.map((task, index) => {
          return (
            <MenuItem key={index} sx={{gap: 0.5}}>
              <ListItemIcon
                sx={{
                  fontSize: '1.5rem',
                }}
              >
                <Assignment />
              </ListItemIcon>
              <ListItemText primary={task.opgave} secondary={task.created_at.slice(0, 10)} />
              <IconButton
                sx={{
                  pointerEvents: 'auto',
                }}
                aria-label="Mark as done"
                onClick={() => handleMarkAsDone(task)}
              >
                <DoneIcon />
              </IconButton>
              <IconButton
                sx={{
                  pointerEvents: 'auto',
                }}
                aria-label="Edit task"
                onClick={() => {
                  setSelectedNotification(task);
                  openUpdateModal();
                }}
              >
                <Edit />
              </IconButton>
            </MenuItem>
          );
        })}
      </Menu>
      <CreateManualTaskModal open={isModalOpen} closeModal={closeModal} />
      {isUpdateModalOpen && (
        <UpdateNotificationModal
          open={isUpdateModalOpen}
          closeModal={closeUpdateModal}
          notification={selectedNotification}
        />
      )}
    </div>
  );
};

export default NotificationList;
