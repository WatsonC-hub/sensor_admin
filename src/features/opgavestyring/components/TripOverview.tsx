import {Box} from '@mui/material';
import React from 'react';

import {calculateContentHeight} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import Map from '~/pages/field/overview/Map';

const TripOverview = () => {
  const {isMobile} = useBreakpoints();
  return (
    <Box
      justifyContent={'center'}
      alignSelf={'center'}
      p={1}
      pt={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? 350 : calculateContentHeight(628),
        width: '100%',
        justifySelf: 'center',
        overflow: 'hidden',
      }}
    >
      <Map key="taskmap" />
    </Box>
  );
};

export default TripOverview;
