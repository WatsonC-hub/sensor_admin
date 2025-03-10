import {Box, Typography} from '@mui/material';
import React from 'react';
import {Notification, NotificationMap} from '~/hooks/query/useNotificationOverview';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useTaskStore} from '../api/useTaskStore';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';

type Props = {
  itemData: NotificationMap;
  onClick: () => void;
};

const LocationListItem = ({itemData, onClick}: Props) => {
  const {tasks} = useTaskStore();
  let notifications: Notification[] = [];
  const filteredTasks = tasks?.filter((task) => task.loc_id === itemData.loc_id && task.is_created);

  /**
   * Filtrere efter notificationer og opgaver - samt nyopsætninger
   * Fremadrettet kommer nyopsætninger til at være opgaver, så det kan være vi skal fjerne dette.
   */
  notifications = itemData.otherNotifications.filter(
    (notification) =>
      notification.type !== 'none' ||
      (notification.active === null &&
        notification.loctype_id !== 12 &&
        notification.calculated !== true)
  );

  if (itemData.type !== 'none') {
    if (!notifications.map((notification) => notification.ts_id).includes(itemData.ts_id))
      notifications = [itemData, ...notifications];
  }

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
          return (
            <Box
              key={notification.ts_name}
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'space-between'}
              py={1}
              gap={1}
            >
              <Box display={'flex'} flexDirection={'row'} pb={1} gap={1}>
                <NotificationIcon iconDetails={task !== undefined ? {} : notification} />
                <Typography>
                  {notification.type === 'notification'
                    ? notification.opgave
                    : filteredTasks?.find((task) => task.ts_id === notification.ts_id)?.name}
                </Typography>
              </Box>
              <Box>
                <Typography>
                  {filteredTasks?.find((task) => task.ts_id === notification.ts_id) !== undefined
                    ? convertDateWithTimeStamp(
                        filteredTasks?.find((task) => task.ts_id === notification.ts_id)
                          ?.due_date ?? null
                      )
                    : convertDateWithTimeStamp(notification.dato)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default LocationListItem;
