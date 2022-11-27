import React, {useState, useContext, useRef, useEffect} from 'react';
import {useTheme} from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import MapIcon from '@mui/icons-material/Map';
import TableChart from '@mui/icons-material/TableChart';
import TabPanel from './TabPanel';
import Map from './Map';
import StationListDesktop from './StationListDesktop';
import StationList from './StationList';
import useMediaQuery from '@mui/material/useMediaQuery';
import {getSensorData} from 'src/pages/field/fieldAPI';
import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import ScrollTop from '../../../components/ScrollTop';
import {apiClient} from 'src/apiClient';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import BoreholeList from './BoreholeList';
import BoreholeListDesktop from './BoreholeListDesktop';

const tabAtom = atom(0);
const tabAtomInner = atom(0);

export default function OverviewPage() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useAtom(tabAtom);
  const [tabValueInner, setTabValueInner] = useAtom(tabAtomInner);

  const {data: tabledata, isLoading} = useQuery(['station_list'], async () => {
    const {data} = await apiClient.get(`/sensor_field/station_list`);
    return data;
  });

  const {data: boreholetabledata, boreholeIsLoading} = useQuery(['borehole_list'], async () => {
    const {data} = await apiClient.get(`/sensor_field/borehole_list`);
    return data;
  });

  const {data: mapData, isLoading: mapLoading} = useQuery(['map_data'], () => getSensorData(), {
    refetchInterval: 120000,
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
        {value === index && <Box p={3}>{children}</Box>}
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
    <div>
      <Tabs
        value={tabValue}
        onChange={handleChange}
        variant="fullWidth"
        aria-label="simple tabs example"
      >
        <Tab icon={TableIcon} />
        <Tab icon={KortIcon} />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        {boreholetabledata ? (
          matches ? (
            <div>
              <AppBar position="static" color="default" style={{width: '70%', marginLeft: '15%'}}>
                <Tabs
                  value={tabValueInner}
                  onChange={handleChangeInner}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab label="Mine stationer" {...a11yProps(0)} />
                  <Tab label="Mine DGU boringer" {...a11yProps(1)} />
                </Tabs>
              </AppBar>
              <TabPanel value={tabValueInner} index={0} dir={theme.direction}>
                <StationList data={tabledata} loading={isLoading} />
              </TabPanel>
              <TabPanel value={tabValueInner} index={1} dir={theme.direction}>
                <BoreholeList data={boreholetabledata} loading={boreholeIsLoading} />
              </TabPanel>
            </div>
          ) : (
            <div>
              <AppBar position="static" color="default" style={{width: '50%', marginLeft: '25%'}}>
                <Tabs
                  value={tabValueInner}
                  onChange={handleChangeInner}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  aria-label="full width tabs example"
                >
                  <Tab label="Mine stationer" {...a11yProps(0)} />
                  <Tab label="Mine DGU boringer" {...a11yProps(1)} />
                </Tabs>
              </AppBar>
              <TabPanel value={tabValueInner} index={0} dir={theme.direction}>
                <StationListDesktop data={tabledata} loading={isLoading} />
              </TabPanel>
              <TabPanel value={tabValueInner} index={1} dir={theme.direction}>
                <BoreholeListDesktop data={boreholetabledata} loading={boreholeIsLoading} />
              </TabPanel>
            </div>
          )
        ) : matches ? (
          <StationList data={tabledata} />
        ) : (
          <StationListDesktop data={tabledata} loading={isLoading} />
        )}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Map
          sensorData={mapData}
          boreholeData={boreholetabledata}
          loading={mapLoading}
          boreholeLoading={boreholeIsLoading}
        />
      </TabPanel>
      {matches && <ScrollTop threshold={100} />}
    </div>
  );
}
