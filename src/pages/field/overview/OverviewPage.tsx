import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MapIcon from '@mui/icons-material/Map';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import type {BoxProps} from '@mui/material/Box';
import {useTheme} from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import React, {SyntheticEvent} from 'react';

import {apiClient} from '~/apiClient';
import NavBar from '~/components/NavBar';
import {
  useNotificationOverview,
  useNotificationOverviewMap,
} from '~/hooks/query/useNotificationOverview';
import {authStore} from '~/state/store';

import ScrollTop from '../../../components/ScrollTop';

import BoreholeTable from './components/BoreholeTable';
import StationTable from './components/StationTable';
import Map from './Map';

const tabAtom = atom(0);
const tabAtomInner = atom(0);

export interface BoreholeData {
  boreholeno: string;
  latitude: number;
  longitude: number;
  intakeno: number[];
  plantname: string;
  plantid: number;
  drilldepth: number[];
  measurement: number[];
  status: number[];
  timeofmeas: string[];
  calypso_id: number[];
  num_controls_in_a_year: number[];
}

export default function OverviewPage() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useAtom<number>(tabAtom);
  const [tabValueInner, setTabValueInner] = useAtom<number>(tabAtomInner);
  const [iotAccess, boreholeAccess] = authStore((state) => [state.iotAccess, state.boreholeAccess]);

  const {data: tabledata, isLoading} = useQuery({
    queryKey: ['station_list'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station_list`);
      return data;
    },
    enabled: iotAccess,
    // refetchInterval: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const {data: boreholetabledata, isLoading: boreholeIsLoading} = useQuery({
    queryKey: ['borehole_list'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole_list`);
      return data;
    },
    enabled: boreholeAccess,
  });

  const {data: boreholeMapdata, isLoading: boreholeMapIsLoading} = useQuery<BoreholeData[]>({
    queryKey: ['borehole_map'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole_map`);
      return data;
    },
    enabled: boreholeAccess,
  });

  const {data: mapData, isLoading: mapLoading} = useNotificationOverviewMap({
    enabled: iotAccess,
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
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <NavBar />
      <Tabs
        value={tabValue}
        onChange={handleChange}
        variant="fullWidth"
        aria-label="simple tabs example"
        sx={{
          '& .MuiTab-root': {
            // height: '48px',
            minHeight: '48px',
            borderBottom: '1px solid #e0e0e0',
          },
        }}
      >
        <Tab label="Kort" icon={<MapIcon />} iconPosition="start" />
        <Tab icon={<FormatListBulletedIcon />} iconPosition="start" label="Liste" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <Map
          sensorData={mapData}
          boreholeData={boreholeMapdata}
          loading={mapLoading && iotAccess}
          boreholeLoading={boreholeMapIsLoading && boreholeAccess}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Tabs
          value={tabValueInner}
          onChange={handleChangeInner}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            margin: matches ? '0' : 'auto',
            '& .MuiTab-root': {
              // height: '48px',
              minHeight: '48px',
            },
          }}
          variant={matches ? 'fullWidth' : 'standard'}
          aria-label="full width tabs example"
        >
          {iotAccess && <Tab label="Mine stationer" {...a11yProps(0)} />}
          {boreholeAccess && <Tab label="Mine DGU boringer" {...a11yProps(iotAccess ? 1 : 0)} />}
        </Tabs>

        {iotAccess && (
          <TabPanel value={tabValueInner} index={0}>
            <StationTable data={tabledata} isLoading={isLoading} />
          </TabPanel>
        )}
        {boreholeAccess && (
          <TabPanel value={tabValueInner} index={iotAccess ? 1 : 0}>
            <BoreholeTable data={boreholetabledata} isLoading={boreholeIsLoading} />
          </TabPanel>
        )}
      </TabPanel>

      {matches && <ScrollTop threshold={100} />}
    </Box>
  );
}
