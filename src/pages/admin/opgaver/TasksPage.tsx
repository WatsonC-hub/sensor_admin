import CloseIcon from '@mui/icons-material/Close';
import {Box, IconButton} from '@mui/material';
import React from 'react';

import NavBar from '~/components/NavBar';
import {appBarHeight} from '~/consts';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import TaskInfo from '~/features/tasks/components/TaskInfo';
// import TaskItiniaries from '~/features/tasks/components/TaskItiniaries';
import TasksOverview from '~/features/tasks/components/TasksOverview';
import useBreakpoints from '~/hooks/useBreakpoints';

import '~/pages/admin/opgaver/TasksPage.css';

const TasksPage = () => {
  const {selectedTask, setSelectedTask} = useTaskStore();
  const {isMobile} = useBreakpoints();

  if (isMobile) {
    return (
      <Box>
        <NavBar />
        <Box display="flex" flexDirection={'column'}>
          {selectedTask ? (
            <>
              <IconButton
                sx={{
                  alignContent: 'end',
                  ml: 'auto',
                }}
                onClick={() => setSelectedTask(null)}
              >
                <CloseIcon />
              </IconButton>
              <TaskInfo />
            </>
          ) : (
            <TasksOverview />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <NavBar />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gridTemplateRows: 'auto 1fr',
          height: `calc(100vh - ${appBarHeight} )`,
        }}
      >
        <Box
          className="horizontal"
          sx={{
            gridColumn: '1',
            gridRow: '1 / span 2',
            border: '1px solid black',
            resize: 'horizontal',
            width: '50vw',
            overflow: 'auto',
          }}
        >
          <TasksOverview />
        </Box>
        <Box>
          <TaskInfo />
        </Box>
        {/* <Box
          sx={{
            gridColumn: '2',
            gridRow: '2',
            height: '100%',
            border: '1px solid black',
          }}
        >
          <TaskItiniaries />
        </Box> */}
      </Box>
    </>
  );
};

export default TasksPage;
