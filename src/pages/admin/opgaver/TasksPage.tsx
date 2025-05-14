import React from 'react';

import NavBar from '~/components/NavBar';

import TasksOverview from '~/features/tasks/components/TasksOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useUser} from '~/features/auth/useUser';
import AddLocationAlt from '@mui/icons-material/AddLocationAlt';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {Box} from '@mui/material';

const TasksPage = () => {
  const {isMobile} = useBreakpoints();
  const {iotAccess} = useUser();
  const {createStamdata} = useNavigationFunctions();

  return (
    <>
      <NavBar zIndex={500}>
        <NavBar.Logo />
        {isMobile ? <NavBar.Scanner /> : <NavBar.Title title="Field" />}
        <Box display={'flex'}>
          <NavBar.LocationList />
          <NavBar.TripList />
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

      <TasksOverview />
    </>
  );
};

export default TasksPage;
