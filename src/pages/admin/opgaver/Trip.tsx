import {Box, Divider} from '@mui/material';
import React from 'react';

import {useTaskManagement} from '~/features/opgavestyring/api/useTaskManagement';
import TripPreparation from '~/features/opgavestyring/components/TripPreparation';
import {useTaskItinerary} from '~/features/tasks/api/useTaskItinerary';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';

const Trip = () => {
  const {isMobile} = useBreakpoints();

  const {itinerary_id} = useDisplayState((state) => state);

  const {
    getItineraryTasks: {data: tasks},
  } = useTaskItinerary(itinerary_id!);

  const loc_ids = [...new Set(tasks?.map((task) => task.loc_id))];
  const {data} = useTaskManagement({loc_ids: loc_ids});

  return (
    <Box mt={4} mb={isMobile ? 0 : 2}>
      <Box display={'flex'} flexDirection={'column'}>
        <TripPreparation data={data} />
      </Box>
    </Box>
  );
};

export default Trip;
