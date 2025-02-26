import {Box} from '@mui/material';

import React from 'react';
import WindowManager from '~/components/ui/WindowManager';

import {calculateContentHeight} from '~/consts';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import TaskMap from '~/pages/admin/opgaver/TaskMap';
import TaskInfo from './TaskInfo';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
// import {NotificationMap} from '~/hooks/query/useNotificationOverview';
// import {BoreholeMapData} from '~/types';

const TasksOverview = () => {
  const {activeTasks, selectedTask, setSelectedTask} = useTaskStore();

  // const [{onColumnFiltersChange}] = useStatefullTableAtom('taskTableState');

  const clickCallback = (data: NotificationMap) => {
    if ('loc_id' in data) {
      const tasks = activeTasks.filter((task) => task.loc_id === data.loc_id);
      // onColumnFiltersChange && onColumnFiltersChange([{id: 'loc_id', value: data.loc_id}]);
      if (tasks.length == 1) {
        setSelectedTask(tasks[0].id);
      } else {
        setSelectedTask(null);
      }
    }
    // setSelectedTask(null);
  };

  return (
    <Box display="flex" flexDirection="column" minHeight={`calc(100vh-68px)`}>
      <Box
        justifyContent={'center'}
        alignSelf={'center'}
        // p={1}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          height: calculateContentHeight(64),
          width: '100%',
          justifySelf: 'center',
          overflow: 'hidden',
          backgroundColor: 'white',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            height: calculateContentHeight(64),
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <TaskMap key="taskmap" clickCallback={clickCallback} />
        </Box>

        <WindowManager columnWidth={400}>
          <WindowManager.Window show={true} size={1}>
            WEUYASYUDGASUJYDGUYIASDG{' '}
          </WindowManager.Window>

          <WindowManager.Window
            show={selectedTask != null}
            size={2}
            onClose={() => setSelectedTask(null)}
          >
            <TaskInfo />
          </WindowManager.Window>
        </WindowManager>
      </Box>
    </Box>
  );
};

export default TasksOverview;
