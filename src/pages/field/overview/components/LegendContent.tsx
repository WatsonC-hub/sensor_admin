import {Box, Divider, Typography} from '@mui/material';
import React from 'react';

import {boreholeColors} from '~/consts';
import TaskIcon from '~/pages/field/overview/components/TaskIcon';
import {useDrawerContext} from '~/state/contexts';

import BoreholeIcon from './BoreholeIcon';

const iotItems = [
  {color: 'red', text: 'Kritisk'},
  {color: 'orange', text: 'Advarsel'},
  {color: 'yellow', text: 'Opmærksom'},
  {color: 'green', text: 'Alt vel'},
  {color: 'grey', text: 'Inaktiv'},
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
        <Box>
          <Typography variant="body1">IoT</Typography>
          {iotItems.map((item) => (
            <Box display="flex" alignItems="center" gap={1} key={item.text}>
              <TaskIcon color={item.color} />
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
