import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MapIcon from '@mui/icons-material/Map';
import Box from '@mui/material/Box';
import type {BoxProps} from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import React, {SyntheticEvent} from 'react';

import {apiClient} from '~/apiClient';
import NavBar from '~/components/NavBar';
import ScrollTop from '~/components/ScrollTop';
import {tabsHeight} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import BoreholeTable from '~/pages/field/overview/components/BoreholeTable';
import StationTable from '~/pages/field/overview/components/StationTable';
import {TableData} from '~/types';

import Map from './Map';
import {useUser} from '~/features/auth/useUser';
import useBorehole from '~/features/station/api/useBorehole';

const tabAtom = atom(0);
const tabAtomInner = atom(0);

export default function OverviewPage() {
  const {isMobile} = useBreakpoints();
  const [tabValue, setTabValue] = useAtom<number>(tabAtom);
  const [tabValueInner, setTabValueInner] = useAtom<number>(tabAtomInner);
  const user = useUser();
  const {admin, createStamdata, dataOverblik} = useNavigationFunctions();
  const {
    get: {data: boreholetabledata},
  } = useBorehole();
  const {data: tabledata} = useQuery<TableData[]>({
    queryKey: ['station_list'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station_list`);
      return data;
    },
    enabled: user?.iotAccess,
    // refetchInterval: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 10 * 1000,
  });

  const handleChange = (_: SyntheticEvent<Element, Event>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangeInner = (_: SyntheticEvent<Element, Event>, newValue: number) => {
    setTabValueInner(newValue);
  };

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
        {value === index && <>{children}</>}
      </Box>
    );
  }

  function a11yProps(index: number) {
    return {id: `full-width-tab-${index}`, 'aria-controls': `full-width-tabpanel-${index}`};
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar>
        <NavBar.Logo />
        {isMobile ? <NavBar.Scanner /> : <NavBar.Title title="Field" />}
        <NavBar.Menu
          items={[
            {
              title: 'Data overblik',
              icon: <FormatListBulletedIcon fontSize="medium" />,
              onClick: () => {
                dataOverblik();
              },
            },
            {
              title: 'Admin',
              icon: <AdminPanelSettingsIcon fontSize="medium" />,
              onClick: () => {
                admin();
              },
            },
            ...(user?.iotAccess
              ? [
                  {
                    title: 'Opret lokation',
                    icon: <AddLocationAltIcon fontSize="medium" />,
                    onClick: () => {
                      createStamdata();
                    },
                  },
                ]
              : []),
          ]}
        />
      </NavBar>
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
        <Tab label="Kort" icon={<MapIcon />} iconPosition="start" />
        <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label="Liste" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <Map key="map" />
        {/* <Map /> */}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Tabs
          value={tabValueInner}
          onChange={handleChangeInner}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            margin: isMobile ? '0' : 'auto',
            '& .MuiTab-root': {
              // height: '48px',
              minHeight: tabsHeight,
            },
          }}
          variant={isMobile ? 'fullWidth' : 'standard'}
          aria-label="full width tabs example"
        >
          {user?.iotAccess && <Tab label="Mine stationer" {...a11yProps(0)} />}
          {user?.boreholeAccess && (
            <Tab label="Mine DGU boringer" {...a11yProps(user?.iotAccess ? 1 : 0)} />
          )}
        </Tabs>

        {user?.iotAccess && (
          <TabPanel value={tabValueInner} index={0}>
            <StationTable data={tabledata} />
          </TabPanel>
        )}
        {user?.boreholeAccess && (
          <TabPanel value={tabValueInner} index={user?.iotAccess ? 1 : 0}>
            <BoreholeTable data={boreholetabledata} />
          </TabPanel>
        )}
      </TabPanel>

      {isMobile && <ScrollTop threshold={100} />}
    </Box>
  );
}
