import {Box, Divider, Tab, Tabs} from '@mui/material';
import {parseAsArrayOf, parseAsStringLiteral, parseAsInteger, useQueryState} from 'nuqs';
import React from 'react';
import {useParams} from 'react-router-dom';

import NavBar from '~/components/NavBar';
import {tabsHeight} from '~/consts';
import {useTaskManagement} from '~/features/opgavestyring/api/useTaskManagement';
import TripOverview from '~/features/opgavestyring/components/TripOverview';
import TripPreparation from '~/features/opgavestyring/components/TripPreparation';
import {useTaskItinerary} from '~/features/tasks/api/useTaskItinerary';
import TabPanel from '~/pages/field/overview/TabPanel';

const tabValues = ['forberedelse', 'overblik'] as const;

const Trip = () => {
  const params = useParams();

  // const {tasks} = useTaskStore();

  const [queryLocIds] = useQueryState('loc_ids', parseAsArrayOf(parseAsInteger).withDefault([]));

  const {
    getItineraryTasks: {data: tasks},
  } = useTaskItinerary(params.trip_id);

  const [tabValue, setTabValue] = useQueryState(
    'page',
    parseAsStringLiteral(tabValues).withDefault('forberedelse')
  );

  const loc_ids = [...new Set(tasks?.map((task) => task.loc_id))];
  console.log('loc_ids', loc_ids);
  const {data} = useTaskManagement({loc_ids: loc_ids.length > 0 ? loc_ids : queryLocIds});

  return (
    <Box mb={2}>
      <NavBar />
      <Box
        display={'flex'}
        flexDirection={'column'}
        gap={2}
        m={'auto'}
        width={'100%'}
        maxWidth={1080}
      >
        <Tabs
          value={tabValue ?? 'forberedelse'}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant={'fullWidth'}
          aria-label="simple tabs example"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              height: tabsHeight,
              minHeight: tabsHeight,
            },
            marginTop: 1,
          }}
        >
          <Tab value={'forberedelse'} label={'Forberedelse'} />
          <Tab value={'overblik'} label={'Kort overblik'} />
        </Tabs>
        <Divider />
        <TabPanel value={tabValue} index="forberedelse">
          <TripPreparation data={data} trip_id={params.trip_id} />
        </TabPanel>
        <TabPanel value={tabValue} index="overblik">
          <TripOverview />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default Trip;
