import {/*AddTask,*/ Assignment /*Update*/} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {Avatar, Badge, IconButton, ListItemIcon, ListItemText, Menu, MenuItem} from '@mui/material';
import {groupBy, map, maxBy, sortBy} from 'lodash';
import React, {useState} from 'react';

import {useTaskState} from '~/features/tasks/api/useTaskState';
// import ConvertTaskModal from '~/features/tasks/components/ConvertTaskModal';
import CreateManualTaskModal from '~/features/tasks/components/CreateManuelTaskModal';
// import UpdateNotificationModal from '~/features/tasks/components/UpdateNotificationModal';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useLocationNotificationOverview} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';
import {getColor} from '~/features/notifications/utils';
import {useUser} from '~/features/auth/useUser';
import {useDisplayState} from '~/hooks/ui';
// Mock data for notifications
const NotificationList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const user = useUser();
  const [isModalOpen, setModalOpen] = useState(false);
  // const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  // const [isMakeTaskModalOpen, setMakeTaskModalOpen] = useState(false);
  // const [selectedNotification /*, setSelectedNotification*/] = useState(null);
  const {ts_id, loc_id: app_loc_id} = useAppContext(['ts_id'], ['loc_id']);

  let loc_id = undefined;
  const {tasks} = useTaskState();
  const setSelectedTask = useDisplayState((state) => state.setSelectedTask);
  const {tasks: tasksNavigation} = useNavigationFunctions();
  const {data: metadata} = useTimeseriesData();

  const {data, isPending} = useLocationNotificationOverview(metadata?.loc_id);

  const handleClick = (event: any) => {
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

  if (loc_id == undefined) {
    loc_id = data?.filter((elem) => elem.ts_id == ts_id)[0]?.loc_id;
  }

  const {
    feature_permission_query: {data: permissions},
  } = usePermissions(app_loc_id ?? loc_id);

  const grouped = groupBy(
    data?.filter((elem) => elem.notification_id != 0),
    'notification_id'
  );

  const mapped = map(grouped, (group) => {
    return maxBy(group, (item) => (item.dato ? new Date(item.dato) : Number.NEGATIVE_INFINITY))!;
  });
  const concat = mapped;
  const notifications = sortBy(concat, (item) => item.dato).reverse();

  // Find index of max flag in notificaitons
  const maxFlagIndex = notifications.reduce(
    (iMax, x, i, arr) => (x.flag > arr[iMax].flag ? i : iMax),
    0
  );

  const badgeColor = getColor(notifications[maxFlagIndex]);

  const tasksOnStation = tasks?.filter((task) => task.loc_id == loc_id && !task.id.includes(':'));

  return (
    <div>
      <IconButton
        aria-label="Show Notifications"
        aria-controls="notifications-menu"
        aria-haspopup="menu"
        color="inherit"
        sx={{
          '&:disabled': {
            color: 'grey.500',
          },
        }}
        onClick={handleClick}
        disabled={
          !user?.simpleTaskPermission &&
          (notifications === undefined || notifications.length === 0) &&
          (tasksOnStation === undefined || tasksOnStation.length === 0)
        }
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
          {
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
          }
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
        {user?.simpleTaskPermission && (
          <MenuItem
            disabled={permissions?.[ts_id] !== 'edit'}
            key="0"
            onClick={openModal}
            sx={{gap: 0.5}}
          >
            <ListItemIcon>
              <Avatar sx={{bgcolor: 'primary'}}>
                <AddIcon fontSize="small" />
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Registrer opgave" />
          </MenuItem>
        )}
        {isPending && <MenuItem>Indlæser...</MenuItem>}
        {notifications?.map((notification, index) => {
          const splitted = notification.ts_name.split(notification.loc_name);
          return (
            <MenuItem
              key={index}
              sx={{gap: 0.5}}
              onClick={() => {
                if (user?.simpleTaskPermission) {
                  setSelectedTask(notification.ts_id + ':' + notification.notification_id);
                  tasksNavigation();
                }
              }}
            >
              <ListItemIcon
                sx={{
                  fontSize: '1.5rem',
                  color: 'white',
                }}
              >
                <NotificationIcon iconDetails={notification} />
              </ListItemIcon>
              <ListItemText
                primary={notification.opgave}
                secondary={
                  splitted[splitted.length - 1].replace('-', '').trim() +
                  ' - ' +
                  notification.dato?.slice(0, 10)
                }
              />
            </MenuItem>
          );
        })}
        {tasksOnStation?.map((task, index) => {
          return (
            <MenuItem
              key={index}
              sx={{gap: 0.5}}
              onClick={() => {
                if (user?.simpleTaskPermission) setSelectedTask(task.id);
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
    </div>
  );
};

export default NotificationList;
