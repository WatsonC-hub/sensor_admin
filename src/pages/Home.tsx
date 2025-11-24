import React from 'react';

import NavBar from '~/components/NavBar';

import useBreakpoints from '~/hooks/useBreakpoints';
import {useUser} from '~/features/auth/useUser';
import AddLocationAlt from '@mui/icons-material/AddLocationAlt';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {Box} from '@mui/material';
import Overview from '~/features/tasks/components/Overview';

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
        <Box alignItems={'center'}>
          {isMobile && <NavBar.Scanner />}
          {/* </TooltipWrapper> */}
          {simpleTaskPermission && <NavBar.OwnTaskList />}
          <NavBar.LocationList />
          {advancedTaskPermission && <NavBar.TripList />}
          <NavBar.Menu
            disableProfile={false}
            items={[
              ...(iotAccess
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

      <Overview />
    </>
  );
};

export default Home;
