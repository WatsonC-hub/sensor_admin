import DirectionsIcon from '@mui/icons-material/Directions';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import {Box, Typography} from '@mui/material';

import Button from '~/components/Button';
import type {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import TaskIcon from '~/pages/field/overview/components/TaskIcon';
import {useDrawerContext} from '~/state/contexts';

interface SensorContentProps {
  data: NotificationMap;
}

const SensorContent = ({data}: SensorContentProps) => {
  const drawerContext = useDrawerContext();
  const {location} = useNavigationFunctions();

  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body1">Status:</Typography>
        <TaskIcon color={data.color} />
        <Typography variant="body1">{data.opgave}</Typography>
      </Box>

      {drawerContext === 'full' && (
        <Box>
          <Typography variant="h6">Andre notifikationer</Typography>
          {data.otherNotifications.map((notification) => {
            const splitted = notification.stationname.split(notification.locname);
            return (
              <Box key={notification.notification_id} display="flex" alignItems="center" gap={1}>
                <Typography variant="body1">
                  {splitted[splitted.length - 1].replace('-', '').trim()}
                </Typography>
                <TaskIcon color={notification.color} />
                <Typography variant="body1">{notification.opgave}</Typography>
              </Box>
            );
          })}
        </Box>
      )}
      <Box display="flex" gap={1} ml="auto" mr={0}>
        <Button
          bttype="tertiary"
          color="primary"
          onClick={() => {
            window.open(
              `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`,
              '_blank'
            );
          }}
          startIcon={<DirectionsIcon />}
        >
          Google Maps
        </Button>
        <Button
          bttype="primary"
          color="primary"
          onClick={() => {
            location(data.locid);
          }}
          startIcon={<ShowChartRoundedIcon />}
        >
          Tidsserie
        </Button>
      </Box>
    </>
  );
};

export default SensorContent;
