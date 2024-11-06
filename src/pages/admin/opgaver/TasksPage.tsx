import {Box} from '@mui/material';
import React, {useEffect} from 'react';

import NavBar from '~/components/NavBar';
import {appBarHeight} from '~/consts';
import {useTasks} from '~/features/tasks/api/useTasks';
import TaskInfo from '~/features/tasks/components/TaskInfo';
import TaskItiniaries from '~/features/tasks/components/TaskItiniaries';
import TasksOverview from '~/features/tasks/components/TasksOverview';
import {useTaskStore} from '~/features/tasks/store';

const TasksPage = () => {
  // const store = useTaskStore();

  return (
    <>
      <NavBar />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          height: `calc(100vh - ${appBarHeight} )`,
        }}
      >
        <Box
          sx={{
            gridColumn: '1',
            gridRow: '1 / span 2',
            border: '1px solid black',
          }}
        >
          <TasksOverview />
        </Box>
        <Box
          sx={{
            gridColumn: '2',
            gridRow: '1',
            border: '1px solid black',
          }}
        >
          <TaskInfo />
        </Box>
        <Box
          sx={{
            gridColumn: '2',
            gridRow: '2',
            border: '1px solid black',
          }}
        >
          <TaskItiniaries />
        </Box>
      </Box>
    </>
  );
};

export default TasksPage;
