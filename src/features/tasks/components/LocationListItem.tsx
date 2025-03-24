import {Box, Typography} from '@mui/material';
import React, {useMemo} from 'react';
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

  const memoizedTasks = useMemo(() => {
    return tasks?.filter((task) => task.loc_id === itemData.loc_id);
  }, [tasks]);

  const {data: notifications} = useNotificationOverview({
    select: (data) => data.filter((item) => item.loc_id === itemData.loc_id),
  });

  const memoizedNotification = useMemo(() => notifications, [itemData.loc_id]);

  return (
    <Box onClick={onClick}>
      <Typography fontWeight={'bold'}>{itemData.loc_name}</Typography>
      <Box display={'flex'} flexDirection={'column'} gap={1} px={1}>
        {memoizedTasks?.map((task) => {
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
                      memoizedNotification?.find(
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
