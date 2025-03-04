import '~/pages/admin/opgaver/TasksPage.css';

import React from 'react';

import NavBar from '~/components/NavBar';

import TasksOverview from '~/features/tasks/components/TasksOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useUser} from '~/features/auth/useUser';
import AddLocationAlt from '@mui/icons-material/AddLocationAlt';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const TasksPage = () => {
  const {isMobile} = useBreakpoints();
  const {iotAccess} = useUser();
  const {createStamdata} = useNavigationFunctions();

  // if (isMobile) {
  //   return (
  //     <Box>
  //       <NavBar>
  //         <NavBar.Logo />
  //         <NavBar.Menu />
  //       </NavBar>
  //       <Box display="flex" flexDirection={'column'}>
  //         {selectedTask ? (
  //           <>
  //             <IconButton
  //               sx={{
  //                 alignContent: 'end',
  //                 ml: 'auto',
  //               }}
  //               onClick={() => setSelectedTask(null)}
  //             >
  //               <CloseIcon />
  //             </IconButton>
  //             <TaskInfo />
  //           </>
  //         ) : (
  //           <TasksOverview />
  //         )}
  //       </Box>
  //     </Box>
  //   );
  // }

  return (
    <>
      <NavBar zIndex={500}>
        <NavBar.Logo />
        {isMobile ? <NavBar.Scanner /> : <NavBar.Title title="Field" />}
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
      </NavBar>

      <TasksOverview />
    </>
  );
};

export default TasksPage;
