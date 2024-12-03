import {Box, Typography} from '@mui/material';
import React, {useContext} from 'react';

import {boreholeColors} from '~/consts';
import BoreholeIcon from '~/pages/field/overview/components/BoreholeIcon';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {DrawerContext} from '~/state/contexts';

const iotItems = [
  {flag: 0, text: 'Alt vel'},
  {flag: 1, text: 'Opmærksom'},
  {flag: 2, text: 'Advarsel'},
  {flag: 3, text: 'Kritisk'},
  {loctype_id: 12, text: 'Enkeltmåling'},
  {active: null, text: 'Nyopsætning'},
  // {notification_id: 12, text: 'Plateau'},
  // {notification_id: 13, text: 'Automatisk kvalitetssikring'},
  {active: false, text: 'Inaktiv'},
  {
    notify_type: 'obs' as const,
    flag: 3,
    text: 'Ydre ring indikerer ikke drift kritiske notifikationer',
  },
];

const LegendContent = () => {
  const drawerContext = useContext(DrawerContext);
  return (
    <>
      {drawerContext === 'full' && (
        <Box
          sx={{
            display: 'grid',
            gap: 1,
            gridTemplateColumns: 'auto auto',
          }}
        >
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Typography variant="body1">IoT</Typography>
            {iotItems.map((item) => (
              <Box display="flex" alignItems="center" gap={1} key={item.text}>
                <NotificationIcon iconDetails={item} />
                <Typography variant="body1">{item.text}</Typography>
              </Box>
            ))}
          </Box>
          <Box>
            <Typography variant="body1">DGU</Typography>
            {Object.entries(boreholeColors)
              .filter(([key]) => key != '1')
              .map(([, item]) => (
                <Box display="flex" alignItems="center" gap={1} key={item.text}>
                  <BoreholeIcon color={item.color} />
                  <Typography variant="body1">{item.text}</Typography>
                </Box>
              ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default LegendContent;
