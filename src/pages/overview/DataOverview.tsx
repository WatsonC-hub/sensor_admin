import {Box} from '@mui/material';
import React from 'react';
import NavBar from '~/components/NavBar';
import Alarms from '~/features/overview/components/Alarms';
import DetailedOverview from '~/features/overview/components/DetailedOverview';
import Groups from '~/features/overview/components/Groups';
import OverviewDrawer from '~/features/overview/components/OverviewDrawer';
import Projects from '~/features/overview/components/Projects';

import {useDataFragmentState} from '~/hooks/useQueryStateParameters';

const DataOverview = () => {
  const [fragmentToShow] = useDataFragmentState();
  return (
    <Layout>
      {fragmentToShow === 'projects' && <Projects />}
      {fragmentToShow === 'groups' && <Groups />}
      {fragmentToShow === 'alarms' && <Alarms />}
      {fragmentToShow === 'units' && <DetailedOverview />}
    </Layout>
  );
};

const Layout = ({children}: {children?: React.ReactNode}) => {
  return (
    <Box>
      <NavBar>
        <Box display="block" flexGrow={1} overflow="hidden"></Box>
        <Box display="flex" flexShrink={0}>
          <NavBar.Home />
          <NavBar.Menu highligtFirst={false} />
        </Box>
      </NavBar>
      <Box
        component="main"
        sx={{flexGrow: 1, display: 'flex', flexDirection: 'row', maxHeight: 'calc(100vh - 64px)'}}
      >
        <OverviewDrawer />
        <Box
          display="flex"
          width={'100%'}
          flexGrow={1}
          gap={1}
          minWidth={0}
          flexDirection={'column'}
          overflow="auto"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DataOverview;
