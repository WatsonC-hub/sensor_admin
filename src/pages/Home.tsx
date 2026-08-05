import AddLocationAlt from '@mui/icons-material/AddLocationAlt';
import {Box} from '@mui/material';
import React from 'react';

import NavBar from '~/components/NavBar';
import {useUser} from '~/features/auth/useUser';
import {MapFilterContextProvider} from '~/features/map/MapFilterProvider';
import Overview from '~/features/tasks/components/Overview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const Home = () => {
  const {isMobile} = useBreakpoints();
  const {
    simpleTaskPermission,
    advancedTaskPermission,
    features: {iotAccess},
  } = useUser();
  const {createStamdata} = useNavigationFunctions();

  return (
    <>
      <NavBar zIndex={100}>
        <NavBar.Logo />
        {/* <TooltipWrapper
          color="white"
          url="https://www.watsonc.dk/guides/kortet/"
          description="Læs mere om hvad du kan på kortet i Field appen"
        > */}
        {!isMobile && <NavBar.Title title="Field" />}
        <Box
          sx={{
            alignItems: 'center',
          }}
        >
          {isMobile && <NavBar.Scanner />}
          {/* </TooltipWrapper> */}
          {simpleTaskPermission && <NavBar.OwnTaskList />}
          <NavBar.LocationList />
          {advancedTaskPermission && <NavBar.TripList />}
          <NavBar.Menu
            disableProfile={false}
            items={
              iotAccess
                ? [
                    {
                      title: 'Opret lokation',
                      icon: <AddLocationAlt fontSize="medium" />,
                      onClick: () => {
                        createStamdata();
                      },
                    },
                  ]
                : []
            }
          />
        </Box>
      </NavBar>
      <MapFilterContextProvider>
        <Overview />
      </MapFilterContextProvider>
    </>
  );
};

export default Home;
