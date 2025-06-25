import React from 'react';

import NavBar from '~/components/NavBar';

import useBreakpoints from '~/hooks/useBreakpoints';
import {useUser} from '~/features/auth/useUser';
import AddLocationAlt from '@mui/icons-material/AddLocationAlt';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {Box} from '@mui/material';
import GuardedOverview from '~/features/tasks/components/Overview';
import {withComponentPermission} from '~/hooks/withComponentPermission';
import TooltipWrapper from '~/components/TooltipWrapper';

const Home = () => {
  const {isMobile} = useBreakpoints();
  const user = useUser();
  const {createStamdata} = useNavigationFunctions();

  return (
    <>
      <NavBar key="map" zIndex={100}>
        <NavBar.Logo />
        <TooltipWrapper
          color="white"
          url="https://www.watsonc.dk/guides/kortet/"
          description="Læs mere om hvad du kan på kortet i Field appen"
        >
          {isMobile ? <NavBar.Scanner /> : <NavBar.Title title="Field" />}
        </TooltipWrapper>
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
