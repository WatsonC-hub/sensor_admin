import {Box} from '@mui/material';
import React from 'react';

import {useTaskManagement} from '~/features/opgavestyring/api/useTaskManagement';
import TripPreparation from '~/features/opgavestyring/components/TripPreparation';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';

const Trip = () => {
  const {isMobile} = useBreakpoints();

  const {itinerary_id} = useDisplayState((state) => state);

  const data = useTaskManagement(itinerary_id);

  return (
    <Box display={'flex'} flexDirection={'column'} mt={4} mb={isMobile ? 0 : 2} overflow={'hidden'}>
      <TripPreparation data={data} />
    </Box>
  );
};

export default Trip;
