import React, {Suspense, useEffect} from 'react';
import {useTheme} from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import MapIcon from '@mui/icons-material/Map';
import TableChart from '@mui/icons-material/TableChart';
import Map from './Map';
import StationListDesktop from './StationListDesktop';
import StationList from './StationList';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import ScrollTop from '../../../components/ScrollTop';
import {apiClient} from 'src/apiClient';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import BoreholeList from './BoreholeList';
import BoreholeListDesktop from './BoreholeListDesktop';
import {authStore} from 'src/state/store';
import StationTableGeneric from './components/StationTable';
import BoreholeTableGeneric from './components/BoreholeTable';

const tabAtom = atom(0);
const tabAtomInner = atom(0);
let checked = false;

export default function OverviewPage() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useAtom(tabAtom);
  const [tabValueInner, setTabValueInner] = useAtom(tabAtomInner);
  const [iotAccess, boreholeAccess] = authStore((state) => [state.iotAccess, state.boreholeAccess]);

  useEffect(() => {
    if (!iotAccess && !checked) {
      setTabValue(1);
    }
    checked = true;
  }, [iotAccess]);

  const {data: tabledata, isLoading} = useQuery(
    ['station_list'],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station_list`);
      return data;
    },
    {
      enabled: iotAccess,
      // refetchInterval: 10000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const {data: boreholetabledata, isLoading: boreholeIsLoading} = useQuery(
    ['borehole_list'],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole_list`);
      return data;
    },
    {
      enabled: boreholeAccess,
    }
  );

  const {data: boreholeMapdata, isLoading: boreholeMapIsLoading} = useQuery(
    ['borehole_map'],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole_map`);
      return data;
    },
    {
      enabled: boreholeAccess,
    }
  );

  const {data: mapData, isLoading: mapLoading} = useQuery(
    ['map_data'],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/map_data`);
      return data;
    },
    {
      enabled: iotAccess,
      refetchInterval: 10000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

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
      <TableChart />
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

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  }

  return (
    <>
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
        >
          <Tab icon={KortIcon} />
          <Tab icon={TableIcon} />
        </Tabs>
      </Box>
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
              <StationTableGeneric data={tabledata} loading={isLoading} />
            </TabPanel>
          )}
          {boreholeAccess && (
            <TabPanel value={tabValueInner} index={iotAccess ? 1 : 0} dir={theme.direction}>
              <BoreholeTableGeneric data={boreholetabledata} loading={boreholeIsLoading} />
            </TabPanel>
          )}
        </>
      </TabPanel>
      <TabPanel value={tabValue} index={0}>
        <Map
          sensorData={mapData}
          boreholeData={boreholeMapdata}
          loading={mapLoading}
          boreholeLoading={boreholeMapIsLoading}
        />
      </TabPanel>
      {matches && <ScrollTop threshold={100} />}
    </>
  );
}
