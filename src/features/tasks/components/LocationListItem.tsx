import {Box, Link, Typography} from '@mui/material';
import React from 'react';
import {Notification, NotificationMap} from '~/hooks/query/useNotificationOverview';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useTaskStore} from '../api/useTaskStore';
import {convertDate} from '~/helpers/dateConverter';
import {CalendarIcon} from '@mui/x-date-pickers';

type Props = {
  itemData: NotificationMap;
  onClick: () => void;
};

const LocationListItem = ({itemData, onClick}: Props) => {
  const {tasks} = useTaskStore();
  let notifications: Notification[] = [];
  const filteredTasks = tasks?.filter((task) => task.loc_id === itemData.loc_id && task.is_created);

  notifications = itemData.otherNotifications.filter(
    (notification) => notification.active === true
  );

  if (!notifications.map((notification) => notification.ts_id).includes(itemData.ts_id))
    notifications = [itemData, ...notifications];

  const filteredNotifications: Notification[] = [];
  notifications.map((notification) => {
    if (
      !filteredNotifications
        .map((notification) => notification.loc_id)
        .includes(notification.loc_id)
    )
      filteredNotifications.push(notification);

    if (!filteredNotifications.map((notification) => notification.flag).includes(notification.flag))
      filteredNotifications.push(notification);
  });

  return (
    <Box onClick={onClick}>
      <Typography fontWeight={'bold'}>{itemData.loc_name}</Typography>
      <Box display={'flex'} flexDirection={'column'} gap={1} px={1}>
        {filteredNotifications.map((notification) => {
          const task = filteredTasks?.find((task) => task.ts_id === notification.ts_id);
          const matching = filteredNotifications.find((matching) => matching.ts_id === task?.ts_id);
          const iconDetails = matching ?? notification;
          const splitted = notification.ts_name.split(notification.loc_name);

          const taskName = notification.opgave
            ? notification.opgave
            : task?.name
              ? task?.name
              : undefined;
          return (
            <Box
              key={notification.ts_name}
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
              py={1}
              gap={1}
            >
              <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1}>
                <NotificationIcon iconDetails={iconDetails} />
                <Link style={{cursor: 'pointer'}}>
                  <Typography variant="body2">
                    {splitted[splitted.length - 1].replace('-', '').trim()}
                    {taskName ? ': ' + taskName : ''}
                  </Typography>
                </Link>
              </Box>
              {task?.due_date && (
                <Box display={'flex'} gap={1} alignItems={'center'}>
                  <CalendarIcon fontSize="small" sx={{color: 'grey.700'}} />
                  <Typography variant="body2" color="grey.700">
                    {convertDate(task.due_date)}
                  </Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default LocationListItem;
