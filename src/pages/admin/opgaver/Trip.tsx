import {accordionActionsClasses, Box, Divider, Tab, Tabs, Typography} from '@mui/material';
import {parseAsStringLiteral, useQueryState} from 'nuqs';
import React from 'react';
import {useParams} from 'react-router-dom';

import NavBar from '~/components/NavBar';
import {tabsHeight} from '~/consts';
import {NotificationIDEnum} from '~/features/notifications/consts';
import {getIcon} from '~/features/notifications/utils';
import {useTaskManagement} from '~/features/opgavestyring/api/useTaskManagement';
import TripNotificationTable from '~/features/opgavestyring/components/TripNotificationTable';
import TripOverview from '~/features/opgavestyring/components/TripOverview';
import TripPreparation from '~/features/opgavestyring/components/TripPreparation';
import TripTaskTable from '~/features/opgavestyring/components/TripTaskTable';
import {useTaskItinerary} from '~/features/tasks/api/useTaskItinerary';
import {useDisplayState} from '~/hooks/ui';
import useBreakpoints from '~/hooks/useBreakpoints';
import TabPanel from '~/pages/field/overview/TabPanel';

const tabValues = ['forberedelse', 'overblik'] as const;

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
      <Box display={'flex'} flexDirection={'column'} gap={2} m={'auto'} width={'100%'}>
        <Divider />
        <TripPreparation data={data} />
      </Box>
    </Box>
  );
};

export default Trip;
