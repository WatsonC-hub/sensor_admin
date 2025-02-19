import {/*AddTask,*/ Assignment /*Update*/} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {Avatar, Badge, IconButton, ListItemIcon, ListItemText, Menu, MenuItem} from '@mui/material';
import {groupBy, map, maxBy, sortBy} from 'lodash';
import React, {useContext, useState} from 'react';

import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import ConvertTaskModal from '~/features/tasks/components/ConvertTaskModal';
import CreateManualTaskModal from '~/features/tasks/components/CreateManuelTaskModal';
import UpdateNotificationModal from '~/features/tasks/components/UpdateNotificationModal';
import {useLocationNotificationOverview} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon, {getColor} from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';

// Mock data for notifications
const NotificationList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isMakeTaskModalOpen, setMakeTaskModalOpen] = useState(false);
  const [selectedNotification /*, setSelectedNotification*/] = useState(null);
  const {ts_id} = useAppContext(['ts_id']);
  let loc_id = undefined;
  const {setSelectedTask, activeTasks} = useTaskStore();
  const {tasks: tasksNavigation} = useNavigationFunctions();

  // const {data, isPending} = useNotificationOverview();
  const metadata = useContext(MetadataContext);

  const {data, isPending} = useLocationNotificationOverview(params.locid || metadata?.loc_id);
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

  // const openUpdateModal = () => {
  //   setUpdateModalOpen(true);
  //   handleClose();
  // };

  const closeModal = () => {
    setModalOpen(false);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
  };

  const handleMarkAsDone = (notification) => {
    markAsDone.mutate({
      path: ts_id,
      data: {
        opgave: notification.opgave,
      },
    });
  };

  if (loc_id == undefined) {
    loc_id = data?.filter((elem) => elem.ts_id == ts_id)[0]?.loc_id;
  }

  const grouped = groupBy(
    data?.filter((elem) => elem.notification_id != 0),
    'notification_id'
  );

  const mapped = map(grouped, (group) => {
    return maxBy(group, (item) => (item.dato ? new Date(item.dato) : Number.NEGATIVE_INFINITY));
  });
  const concat = mapped;
  const notifications = sortBy(concat, (item) => item.dato).reverse();

  // Find index of max flag in notificaitons
  const maxFlagIndex = notifications?.reduce(
    (iMax, x, i, arr) => (x.flag > arr[iMax].flag ? i : iMax),
    0
  );

  const badgeColor = getColor(notifications[maxFlagIndex]);

  const tasksOnStation = activeTasks?.filter(
    (task) => task.loc_id == loc_id && !task.id.includes(':')
  );

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
            badgeContent={tasksOnStation?.length}
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
            <MenuItem
              key={index}
              sx={{gap: 0.5}}
              onClick={() => {
                setSelectedTask(notification.ts_id + ':' + notification.notification_id);
                tasksNavigation();
              }}
            >
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

              {/* <IconButton
                sx={{
                  pointerEvents: 'auto',
                }}
                aria-label="Make task"
                onClick={() => {
                  setSelectedNotification(notification);
                  setMakeTaskModalOpen(true);
                }}
              >
                <AddTask />
              </IconButton>

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
                <Update />
              </IconButton> */}
            </MenuItem>
          );
        })}
        {tasksOnStation?.map((task, index) => {
          return (
            <MenuItem
              key={index}
              sx={{gap: 0.5}}
              onClick={() => {
                setSelectedTask(task.id);
                tasksNavigation();
              }}
            >
              <ListItemIcon
                sx={{
                  fontSize: '1.5rem',
                }}
              >
                <Assignment />
              </ListItemIcon>
              <ListItemText primary={task.name} secondary={task.created_at.slice(0, 10)} />
            </MenuItem>
          );
        })}
      </Menu>
      {isModalOpen && <CreateManualTaskModal open={isModalOpen} closeModal={closeModal} />}
      {isUpdateModalOpen && (
        <UpdateNotificationModal
          open={isUpdateModalOpen}
          closeModal={closeUpdateModal}
          notification={selectedNotification}
        />
      )}
      {isMakeTaskModalOpen && (
        <ConvertTaskModal
          open={isMakeTaskModalOpen}
          closeModal={() => setMakeTaskModalOpen(false)}
          notification={selectedNotification}
        />
      )}
    </div>
  );
};

export default NotificationList;
