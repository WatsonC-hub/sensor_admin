import React from 'react';

import NavBar from '~/components/NavBar';

import Overview from '~/features/tasks/components/Overview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAccessControl} from '~/features/auth/useUser';
import AddLocationAlt from '@mui/icons-material/AddLocationAlt';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {Box} from '@mui/material';

const Home = () => {
  const {isMobile} = useBreakpoints();
  const accessControl = useAccessControl();
  const {createStamdata} = useNavigationFunctions();

  return (
    <>
      <NavBar key="map" zIndex={100}>
        <NavBar.Logo />
        {isMobile ? <NavBar.Scanner /> : <NavBar.Title title="Field" />}
        <Box display={'flex'}>
          <NavBar.LocationList />
          {accessControl?.features.tasks === 'advanced' && <NavBar.TripList />}
          <NavBar.Menu
            disableProfile={false}
            items={[
              ...(accessControl?.features.iotAccess
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
