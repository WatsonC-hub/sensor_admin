import {CalendarMonth} from '@mui/icons-material';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MapIcon from '@mui/icons-material/Map';
import {Box, BoxProps, Tab, Tabs} from '@mui/material';
import {atom, useAtom} from 'jotai';
import React, {SyntheticEvent} from 'react';

import {tabsHeight} from '~/consts';

import {useTaskStore} from '../store';

import TaskCalendar from './TaskCalendar';
import TaskMap from './TaskMap';
import TaskTable from './TaskTable';

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
  other?: BoxProps;
}) {
  const {children, value, index, ...other} = props;
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
      {children}
    </Box>
  );
}

const tabAtom = atom<number>(0);

const TasksOverview = () => {
  const [tabValue, setTabValue] = useAtom<number>(tabAtom);
  const {shownMapTaskIds, shownListTaskIds} = useTaskStore();

  const handleChange = (_: SyntheticEvent<Element, Event>, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
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
      <TabPanel value={tabValue} index={0}>
        <TaskMap />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <TaskTable key="task-table" />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <TaskCalendar />
      </TabPanel>
    </Box>
  );
};

export default TasksOverview;
