import {Box, Divider, Typography} from '@mui/material';
import React from 'react';

import {boreholeColors} from '~/consts';
import BoreholeIcon from '~/pages/field/overview/components/BoreholeIcon';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import {useDrawerContext} from '~/state/contexts';

const iotItems = [
  {flag: 3, text: 'Kritisk'},
  {flag: 2, text: 'Advarsel'},
  {flag: 1, text: 'Opmærksom'},
  {flag: 0, text: 'Alt vel'},
  // {notification_id: 12, text: 'Plateau'},
  // {notification_id: 13, text: 'Automatisk kvalitetssikring'},
  {active: false, text: 'Inaktiv'},
];

const LegendContent = () => {
  const drawerContext = useDrawerContext();

  return (
    <>
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
          {Object.values(boreholeColors).map((item) => (
            <Box display="flex" alignItems="center" gap={1} key={item.text}>
              <BoreholeIcon color={item.color} />
              <Typography variant="body1">{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {drawerContext === 'full' && (
        <Box>
          <Typography variant="body1">Seneste pejlinger</Typography>
          <Divider />
        </Box>
      )}
    </>
  );
};

export default LegendContent;
