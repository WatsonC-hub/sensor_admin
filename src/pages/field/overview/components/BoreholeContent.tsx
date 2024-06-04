import CircleIcon from '@mui/icons-material/Circle';
import DirectionsIcon from '@mui/icons-material/Directions';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import {Box, Divider, Typography} from '@mui/material';
import moment from 'moment';
import React from 'react';

import Button from '~/components/Button';
import {boreholeColors} from '~/consts';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import TaskIcon from '~/pages/field/overview/components/TaskIcon';
import {useDrawerContext} from '~/state/contexts';

import type {BoreholeData} from '../OverviewPage';

interface BoreholeContentProps {
  data: BoreholeData;
}

const BoreholeContent = ({data}: BoreholeContentProps) => {
  const drawerContext = useDrawerContext();
  const {borehole} = useNavigationFunctions();
  const maxStatus = Math.max(...data.status);
  console.log(data);
  return (
    <>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="body1">Status:</Typography>
        <TaskIcon color={boreholeColors[maxStatus].color} />
        <Typography variant="body1">{boreholeColors[maxStatus].text}</Typography>
      </Box>

      {drawerContext === 'full' && (
        <Box>
          <Typography variant="body1">Seneste pejlinger</Typography>
          <Divider />
          {data.intakeno.map((intake, index) => {
            if (data.measurement[index] === null || data.timeofmeas[index] === null) return null;

            return (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight="bold">
                  Indtag {intake}:
                </Typography>
                <Typography variant="body2">{data.measurement[index]} m</Typography>
                <Typography variant="body2">
                  {moment(data.timeofmeas[index]).format('YYYY-MM-DD')}
                </Typography>
                {/* 
              <TaskIcon color={boreholeColors[data.status[index]].color} />
              <Typography variant="body1">{boreholeColors[data.status[index]].text}</Typography> */}
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
            borehole(data.boreholeno);
          }}
          startIcon={<ShowChartRoundedIcon />}
        >
          Boring
        </Button>
      </Box>
    </>
  );
};

export default BoreholeContent;
