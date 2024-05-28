import {Box} from '@mui/material';
import type {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useDrawerContext} from '~/state/contexts';

interface SensorContentProps {
  data: NotificationMap;
}

const SensorContent = ({data}: SensorContentProps) => {
  const drawerContext = useDrawerContext();

  return (
    <>
      <Box>{data.opgave}</Box>
      {data.otherNotifications.map((notification) => (
        <Box key={notification.notification_id}>{notification.opgave}</Box>
      ))}
      {drawerContext === 'full' && <Box>Full content</Box>}
    </>
  );
};

export default SensorContent;
