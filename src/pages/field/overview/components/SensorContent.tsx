import {Box, Typography} from '@mui/material';

import Button from '~/components/Button';
import {convertDateWithTimeStamp} from '~/helpers/dateConverter';
import type {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useDrawerContext} from '~/state/contexts';

interface SensorContentProps {
  data: NotificationMap;
}

const SensorContent = ({data}: SensorContentProps) => {
  const drawerContext = useDrawerContext();
  const {station, adminKvalitetssikring} = useNavigationFunctions();

  const all_notifications = [data, ...data.otherNotifications];

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
              <Button
                bttype="link"
                onClick={() => station(notification.loc_id, notification.ts_id)}
              >
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

      {drawerContext === 'full' && (
        <>
          <Typography variant="h6">Notifikationer</Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            {[data, ...data.otherNotifications]
              .filter((item) => item.opgave !== null)
              .map((notification, index) => {
                notification.notification_id;
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
                        if (notification.isqa) {
                          adminKvalitetssikring(notification.ts_id);
                        } else {
                          station(notification.loc_id, notification.ts_id);
                        }
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
        </>
      )}

      {/* <Box display="flex" gap={1} ml="auto" mr={0}>
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
          startIcon={<PlaceIcon />}
        >
          Lokalitet
        </Button>
      </Box> */}
    </>
  );
};

export default SensorContent;
