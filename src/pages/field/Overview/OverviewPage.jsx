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
import {getTableData, getSensorData} from 'src/pages/field/fieldAPI';
import {useQuery} from '@tanstack/react-query';
import {atom, useAtom} from 'jotai';
import ScrollTop from '../../../components/ScrollTop';
import {apiClient} from 'src/apiClient';

const tabAtom = atom(0);

export default function OverviewPage() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useAtom(tabAtom);

  const {data: tabledata, isLoading} = useQuery(['station_list'], async () => {
    const {data} = await apiClient.get(`/sensor_field/station_list`);
    return data;
  });

  const {data: mapData, isLoading: mapLoading} = useQuery(['map_data'], () => getSensorData(), {
    refetchInterval: 120000,
  });

  const handleChange = (_, newValue) => {
    setTabValue(newValue);
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
        {matches ? (
          <StationList data={tabledata} />
        ) : (
          <StationListDesktop data={tabledata} loading={isLoading} />
        )}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Map sensorData={mapData} loading={mapLoading} />
      </TabPanel>
      {matches && <ScrollTop threshold={100} />}
    </div>
  );
}
