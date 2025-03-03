import {Box, Typography} from '@mui/material';

import Button from '~/components/Button';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import {useNotificationOverviewMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useAppContext} from '~/state/contexts';

const SensorContent = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {station} = useNavigationFunctions();
  const {tasks, setSelectedTask} = useTaskStore();
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
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {unique_stations.map((notification, index) => {
          const splitted = notification.ts_name.split(notification.loc_name);
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              <Button bttype="link" onClick={() => station(notification.ts_id)}>
                {splitted[splitted.length - 1].replace('-', '').trim()}
              </Button>
              <Box display="flex" gap={0.5}>
                <NotificationIcon iconDetails={notification} />
                {/* <Typography variant="body2">{notification.opgave}</Typography> */}
              </Box>
              {/* <Typography variant="body2">{convertDateWithTimeStamp(notification.dato)}</Typography> */}
            </Box>
          );
        })}
      </Box>

      <Typography variant="h6">Notifikationer</Typography>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        {all_notifications
          .filter((item) => item.opgave !== null)
          .map((notification, index) => {
            // notification.notification_id;
            const splitted = notification.ts_name.split(notification.loc_name);
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 0.5,
                  alignItems: 'center',
                }}
              >
                <Button
                  bttype="link"
                  onClick={() => {
                    setSelectedTask(`${notification.ts_id}:${notification.notification_id}`);
                  }}
                >
                  {splitted[splitted.length - 1].replace('-', '').trim()}
                </Button>
                <Box display="flex" gap={1}>
                  <NotificationIcon iconDetails={notification} />
                  <Typography variant="body2">{notification.opgave}</Typography>
                </Box>
                <Typography variant="body2">
                  {convertDateWithTimeStamp(notification.dato)}
                </Typography>
              </Box>
            );
          })}
      </Box>
      <Typography variant="h6">Opgaver</Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {all_tasks.map((task, index) => {
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: 0.5,
                alignItems: 'center',
              }}
            >
              <Button bttype="link" onClick={() => setSelectedTask(task.id)} color="primary">
                {task.name}
              </Button>
              <Typography variant="body2">{task.due_date}</Typography>
            </Box>
          );
        })}
      </Box>
      {/* <Typography variant="h6">Opgaver</Typography> */}
    </>
  );
};

export default SensorContent;
