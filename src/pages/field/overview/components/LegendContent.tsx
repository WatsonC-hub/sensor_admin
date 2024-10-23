import {Circle} from '@mui/icons-material';
import {Box, Divider, Typography} from '@mui/material';
import React from 'react';

import {boreholeColors} from '~/consts';
import BoreholeIcon from '~/pages/field/overview/components/BoreholeIcon';
import NotificationIcon, {CircleBox} from '~/pages/field/overview/components/NotificationIcon';
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
      <Divider sx={{my: 1}} />

      <Box display="flex" flexDirection="column">
        <Box display="flex" gap={1}>
          <CircleBox
            sx={{
              textAlign: 'center',
              bgcolor: 'red',
            }}
          >
            <CircleBox
              sx={{
                height: '1.3em',
                ml: -0.02,
                width: '1.3em',
              }}
            >
              <Circle
                sx={{
                  fontSize: 'inherit',
                  textAlign: 'start',
                  color: '#4caf50',
                }}
              />
            </CircleBox>
          </CircleBox>

          <Typography variant="body2">
            Ringen omkring en IoT station betegner f.eks. at der er QA problemer som ikke er drift
            kritiske. Det som er inde i ringen betegner hvorvidt en IoT station har kritiske
            driftsproblemer.
          </Typography>
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
