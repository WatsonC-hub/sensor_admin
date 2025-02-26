import '~/pages/admin/opgaver/TasksPage.css';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import CloseIcon from '@mui/icons-material/Close';
import {Box, IconButton} from '@mui/material';
import React from 'react';

import NavBar from '~/components/NavBar';
import {appBarHeight} from '~/consts';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import TaskInfo from '~/features/tasks/components/TaskInfo';
import TasksOverview from '~/features/tasks/components/TasksOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const TasksPage = () => {
  const {selectedTask, setSelectedTask} = useTaskStore();
  const {field} = useNavigationFunctions();
  const {isMobile} = useBreakpoints();

  if (isMobile) {
    return (
      <Box>
        <NavBar>
          <NavBar.GoBack />
          <NavBar.Title title="Opgaver" />
          <NavBar.Menu />
        </NavBar>
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
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Title title="Opgaver" />
        <NavBar.Menu
          items={[
            {
              title: 'Field',
              icon: <BuildCircleIcon fontSize="medium" />,
              onClick: () => {
                field();
              },
            },
          ]}
        />
      </NavBar>
      <TasksOverview />
    </>
  );
};

export default TasksPage;
