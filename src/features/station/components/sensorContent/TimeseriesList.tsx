import {Box, Typography} from '@mui/material';
import React from 'react';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {useNotificationOverviewMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

const TimeseriesList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {station} = useNavigationFunctions();
  const {tasks} = useTaskStore();
  const {data, isPending} = useNotificationOverviewMap();

  const locationData = data?.find((item) => item.loc_id === loc_id);
  if (isPending || locationData === undefined) {
    return <Typography>Loading...</Typography>;
  }

  const all_notifications = [locationData, ...locationData.otherNotifications];
  const all_tasks =
    tasks?.filter((task) => task.loc_id === locationData.loc_id && task.is_created) || [];
  const unique_stations = all_notifications
    .filter((item, index, self) => index === self.findIndex((t) => t.ts_id === item.ts_id))
    .filter((item) => item.ts_id !== null);
  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Typography variant="h6" fontSize={'bold'}>
        Tidsserier
      </Typography>
      {unique_stations.map((notification, index) => {
        const splitted = notification.ts_name.split(notification.loc_name);
        const hasTask = notification.opgave !== null;
        return (
          <Box key={index} display="flex" justifyContent={'space-between'} alignItems="center">
            <Box display="flex" gap={1} sx={{cursor: 'pointer'}}>
              <NotificationIcon iconDetails={notification} />
              <Typography
                variant="caption"
                onClick={() => station(notification.ts_id)}
                width={'fit-content'}
              >
                {splitted[splitted.length - 1].replace('-', '').trim()}
                {hasTask && <Typography variant="caption">{': ' + notification.opgave}</Typography>}
              </Typography>
            </Box>
            {all_tasks.find((task) => task.ts_id === notification.ts_id) !== undefined && (
              <Box display="flex" gap={1}>
                <PendingActionsIcon fontSize="small" />
                <Typography variant="caption" alignContent={'center'} color="grey.700">
                  {convertDateWithTimeStamp(
                    all_tasks.find((task) => task.ts_id === notification.ts_id)?.due_date
                  )}
                </Typography>
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TimeseriesList;
