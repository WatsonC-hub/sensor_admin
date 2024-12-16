import {CalendarMonth} from '@mui/icons-material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MapIcon from '@mui/icons-material/Map';
import {Box, BoxProps, Tab, Tabs} from '@mui/material';
import {atom, useAtom} from 'jotai';
import React, {SyntheticEvent} from 'react';

import {tabsHeight, calculateContentHeight} from '~/consts';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import TaskCalendar from '~/features/tasks/components/TaskCalendar';
// import TaskMap from '~/features/tasks/components/TaskMap';
import TaskTable from '~/features/tasks/components/TaskTable';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useStatefullTableAtom} from '~/hooks/useStatefulTableAtom';
import Map from '~/pages/field/overview/Map';
import {BoreholeMapData} from '~/types';

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
  keepMounted?: boolean;
  other?: BoxProps;
}) {
  const {children, value, index, keepMounted, ...other} = props;
  return (
    <Box
      display={value === index ? 'flex' : 'none'}
      flexDirection="column"
      flexGrow={1}
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {keepMounted ? <>{children}</> : value === index && <>{children}</>}
    </Box>
  );
}

const tabAtom = atom<number>(0);

const TasksOverview = () => {
  const [tabValue, setTabValue] = useAtom<number>(tabAtom);
  const {shownMapTaskIds, shownListTaskIds, setShownMapTaskIds, activeTasks, setSelectedTask} =
    useTaskStore();

  const handleChange = (_: SyntheticEvent<Element, Event>, newValue: number) => {
    setTabValue(newValue);
  };

  const [{onColumnFiltersChange}] = useStatefullTableAtom('taskTableState');

  const clickCallback = (data: NotificationMap | BoreholeMapData) => {
    if ('loc_id' in data) {
      // const task_ids = activeTasks
      //   .filter((task) => task.loc_id === data.loc_id)
      //   .map((task) => task.id);
      // setShownMapTaskIds(task_ids);
      const id = activeTasks.find((task) => task.loc_id === data.loc_id)?.id;

      onColumnFiltersChange && onColumnFiltersChange([{id: 'loc_id', value: data.loc_id}]);

      if (id) setSelectedTask(id);
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight={`calc(100vh-68px)`}>
      <Tabs
        value={tabValue}
        onChange={handleChange}
        variant="fullWidth"
        aria-label="simple tabs example"
        sx={{
          '& .MuiTab-root': {
            // height: '48px',
            minHeight: tabsHeight,
            borderBottom: '1px solid #e0e0e0',
          },
        }}
      >
        <Tab
          label={
            <Box>
              Kort{' '}
              <Box
                component="span"
                sx={{
                  display: shownMapTaskIds.length > 0 ? 'inline' : 'none',
                  color: shownMapTaskIds.length > 0 ? 'error.main' : undefined,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                !
              </Box>
            </Box>
          }
          icon={<MapIcon />}
          iconPosition="start"
        />
        <Tab
          icon={<FormatListBulletedIcon />}
          iconPosition="start"
          label={
            <Box>
              Liste{' '}
              <Box
                component="span"
                sx={{
                  display: shownListTaskIds.length > 0 ? 'inline' : 'none',
                  color: shownListTaskIds.length > 0 ? 'error.main' : undefined,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                !
              </Box>
            </Box>
          }
        />
        <Tab icon={<CalendarMonth />} iconPosition="start" label="Kalender" />
      </Tabs>
      <TabPanel key={'map'} value={tabValue} index={0}>
        <Box
          justifyContent={'center'}
          alignSelf={'center'}
          p={1}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: calculateContentHeight(128),
            width: '100%',
            justifySelf: 'center',
            overflow: 'hidden',
          }}
        >
          <Map key="taskmap" clickCallback={clickCallback} />
        </Box>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <TaskTable key="tasktable" />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <TaskCalendar key="taskcalendar" />
      </TabPanel>
    </Box>
  );
};

export default TasksOverview;
