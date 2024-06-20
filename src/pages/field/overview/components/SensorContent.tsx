import DirectionsIcon from '@mui/icons-material/Directions';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import {Box, Typography} from '@mui/material';

import Button from '~/components/Button';
import type {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useDrawerContext} from '~/state/contexts';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';

import NotificationIcon from './NotificationIcon';

interface SensorContentProps {
  data: NotificationMap;
}

const SensorContent = ({data}: SensorContentProps) => {
  const drawerContext = useDrawerContext();
  const {location} = useNavigationFunctions();
  console.log('data', data);
  const splitted = data.stationname.split(data.locname);
  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body2">
          {splitted[splitted.length - 1].replace('-', '').trim()}
        </Typography>
        <Box display="flex" gap={1}>
          <NotificationIcon iconDetails={data} />
          <Typography variant="body2">{data.opgave}</Typography>
        </Box>
        <Typography variant="body2">{convertDateWithTimeStamp(data.dato)}</Typography>
      </Box>

      {drawerContext === 'full' && (
        <>
          <Typography variant="h6">Andre notifikationer</Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: 'fit-content(300px) fit-content(300px) 1fr',
            }}
          >
            {data.otherNotifications.map((notification) => {
              notification.notification_id;
              const splitted = notification.stationname.split(notification.locname);
              return (
                <>
                  <Typography variant="body2">
                    {splitted[splitted.length - 1].replace('-', '').trim()}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <NotificationIcon iconDetails={notification} />
                    <Typography variant="body2">{notification.opgave}</Typography>
                  </Box>
                  <Typography variant="body2">
                    {convertDateWithTimeStamp(notification.dato)}
                  </Typography>
                </>
              );
            })}
          </Box>
        </>
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
