import {Box, Grid, Typography} from '@mui/material';
import type {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useDrawerContext} from '~/state/contexts';
import CircleIcon from '@mui/icons-material/Circle';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import DirectionsIcon from '@mui/icons-material/Directions';
import Button from '~/components/Button';
import {useNavigations} from '~/hooks/useNavigations';
import TaskIcon from '~/pages/field/Overview/components/TaskIcon';

interface SensorContentProps {
  data: NotificationMap;
}

const SensorContent = ({data}: SensorContentProps) => {
  const drawerContext = useDrawerContext();
  const {location} = useNavigations();

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
              <Box display="flex" alignItems="center" gap={1}>
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
          btType="tertiary"
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
          btType="primary"
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
