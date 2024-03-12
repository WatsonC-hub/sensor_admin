import MapIcon from '@mui/icons-material/Map';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import React from 'react';
import NavBar from '~/components/NavBar';
import {apiClient} from '~/apiClient';
import {authStore} from '~/state/store';
import ScrollTop from '../../../components/ScrollTop';
import Map from './Map';
import BoreholeTable from './components/BoreholeTable';
import StationTable from './components/StationTable';

const tabAtom = atom(0);
const tabAtomInner = atom(0);

export default function OverviewPage() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useAtom(tabAtom);
  const [tabValueInner, setTabValueInner] = useAtom(tabAtomInner);
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

  const {data: boreholeMapdata, isLoading: boreholeMapIsLoading} = useQuery({
    queryKey: ['borehole_map'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole_map`);
      return data;
    },
    enabled: boreholeAccess,
  });

  const {data: mapData, isLoading: mapLoading} = useQuery({
    queryKey: ['map_data'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/map_data`);
      return data;
    },
    enabled: iotAccess,
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const handleChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const handleChangeInner = (_, newValue) => {
    setTabValueInner(newValue);
  };

  const KortIcon = (
    <Tooltip title="Kort">
      <MapIcon />
    </Tooltip>
  );

  const TableIcon = (
    <Tooltip title="Tabel">
      <FormatListBulletedIcon />
    </Tooltip>
  );

  function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && <Box p={1}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  return (
    <>
      <NavBar />
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleChange}
          variant="fullWidth"
          aria-label="simple tabs example"
          sx={{
            '& .MuiTab-root': {
              height: '48px',
              minHeight: '48px',
            },
          }}
        >
          <Tab label="Kort" icon={KortIcon} iconPosition="start" />
          <Tab icon={TableIcon} iconPosition="start" label="Liste" />
        </Tabs>
      </Box>
      <TabPanel value={tabValue} index={0}>
        <Map
          sensorData={mapData}
          boreholeData={boreholeMapdata}
          loading={mapLoading && iotAccess}
          boreholeLoading={boreholeMapIsLoading && boreholeAccess}
        />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <>
          <AppBar position="static" color="default" style={{width: matches ? '100%' : '50%'}}>
            <Tabs
              value={tabValueInner}
              onChange={handleChangeInner}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              {iotAccess && <Tab label="Mine stationer" {...a11yProps(0)} />}
              {boreholeAccess && (
                <Tab label="Mine DGU boringer" {...a11yProps(iotAccess ? 1 : 0)} />
              )}
            </Tabs>
          </AppBar>
          {iotAccess && (
            <TabPanel value={tabValueInner} index={0} dir={theme.direction}>
              <StationTable data={tabledata} isLoading={isLoading} />
            </TabPanel>
          )}
          {boreholeAccess && (
            <TabPanel value={tabValueInner} index={iotAccess ? 1 : 0} dir={theme.direction}>
              <BoreholeTable data={boreholetabledata} isLoading={boreholeIsLoading} />
            </TabPanel>
          )}
        </>
      </TabPanel>

      {matches && <ScrollTop threshold={100} />}
    </>
  );
}
