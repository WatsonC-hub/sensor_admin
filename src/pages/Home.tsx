import React from 'react';

import NavBar from '~/components/NavBar';

import useBreakpoints from '~/hooks/useBreakpoints';
import {useUser} from '~/features/auth/useUser';
import AddLocationAlt from '@mui/icons-material/AddLocationAlt';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {Box} from '@mui/material';
import GuardedOverview from '~/features/tasks/components/Overview';
import {withComponentPermission} from '~/hooks/withComponentPermission';

const Home = () => {
  const {isMobile} = useBreakpoints();
  const user = useUser();
  const {createStamdata} = useNavigationFunctions();

  return (
    <>
      <NavBar key="map" zIndex={100}>
        <NavBar.Logo />
        {isMobile ? <NavBar.Scanner /> : <NavBar.Title title="Field" />}
        <Box display={'flex'}>
          <NavBar.LocationList />
          {user?.advancedTaskPermission && <NavBar.TripList />}
          <NavBar.Menu
            disableProfile={false}
            items={[
              ...(user?.features?.iotAccess
                ? [
                    {
                      title: 'Opret lokation',
                      icon: <AddLocationAlt fontSize="medium" />,
                      onClick: () => {
                        createStamdata();
                      },
                    },
                  ]
                : []),
            ]}
          />
        </Box>
      </NavBar>

      <GuardedOverview />
    </>
  );
};

const GuardedHome = withComponentPermission(Home, 'features', ['boreholeAccess', 'iotAccess']);

export default GuardedHome;
