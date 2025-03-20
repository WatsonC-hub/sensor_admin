import {Box, Link, Typography} from '@mui/material';
import React from 'react';
import {MapOverview, useNotificationOverview} from '~/hooks/query/useNotificationOverview';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useTaskStore} from '../api/useTaskStore';
import {convertDate} from '~/helpers/dateConverter';
import {CalendarIcon} from '@mui/x-date-pickers';

type Props = {
  itemData: MapOverview;
  onClick: () => void;
};

const LocationListItem = ({itemData, onClick}: Props) => {
  const {tasks} = useTaskStore();
  // let notifications: Notification[] = [];
  const filteredTasks = tasks?.filter((task) => task.loc_id === itemData.loc_id);
  const {data: notifications} = useNotificationOverview({
    select: (data) => data.filter((item) => item.loc_id === itemData.loc_id),
  });
  /**
   * Filtrere efter notificationer og opgaver - samt nyopsætninger
   * Fremadrettet kommer nyopsætninger til at være opgaver, så det kan være vi skal fjerne dette.
   */
  // notifications = itemData.otherNotifications.filter(
  //   (notification) =>
  //     notification.type !== 'none' ||
  //     (notification.active === null &&
  //       notification.loctype_id !== 12 &&
  //       notification.calculated !== true)
  // );

  // if (itemData.type !== 'none') {
  //   if (!notifications.map((notification) => notification.ts_id).includes(itemData.ts_id))
  //     notifications = [itemData, ...notifications];
  // }

  // const filteredNotifications: Notification[] = [];
  // notifications.map((notification) => {
  //   if (
  //     !filteredNotifications
  //       .map((notification) => notification.loc_id)
  //       .includes(notification.loc_id)
  //   )
  //     filteredNotifications.push(notification);

  //   if (!filteredNotifications.map((notification) => notification.flag).includes(notification.flag))
  //     filteredNotifications.push(notification);
  // });

  return (
    <Box onClick={onClick}>
      <Typography fontWeight={'bold'}>{itemData.loc_name}</Typography>
      <Box display={'flex'} flexDirection={'column'} gap={1} px={1}>
        {filteredTasks?.map((task) => {
          console.log(notifications);
          return (
            <Box
              key={task.id}
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
              py={1}
              gap={1}
            >
              <Box display={'flex'} flexDirection={'row'} pb={1} gap={1}>
                <NotificationIcon
                  iconDetails={{
                    notification_id: task.blocks_notifications[0],
                    flag:
                      notifications?.find(
                        (notification) =>
                          notification.ts_id === task.ts_id &&
                          notification.notification_id == task.blocks_notifications[0]
                      )?.flag ?? 0,
                  }}
                />
                <Typography>{task.name}</Typography>
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
