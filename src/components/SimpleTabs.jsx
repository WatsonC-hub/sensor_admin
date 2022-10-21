import React, { useState, useContext, useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Tooltip from "@mui/material/Tooltip";
import MapIcon from "@mui/icons-material/Map";
import TableChart from "@mui/icons-material/TableChart";
import TabPanel from "./TabPanel";
import Map from "../pages/overview/Map";
import StationListDesktop from "../pages/overview/StationListDesktop";
import LocationContext from "../state/LocationContext";
import StationList from "../pages/overview/StationList";
import useMediaQuery from "@mui/material/useMediaQuery";
import { getTableData, getSensorData } from "../api";
import { useQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import Scroll from "./Scroll";

const tabAtom = atom(0);

export default function SimpleTabs() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useAtom(tabAtom);

  const { data, isLoading } = useQuery(["station_list"], () => getTableData(), {
    refetchInterval: 120000,
  });

  const { data: mapData, isLoading: mapLoading } = useQuery(
    ["map_data"],
    () => getSensorData(),
    {
      refetchInterval: 120000,
    }
  );

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
          <StationList data={data} />
        ) : (
          <StationListDesktop data={data} loading={isLoading} />
        )}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Map sensorData={mapData} loading={mapLoading} />
      </TabPanel>
      {matches && <Scroll showBelow={100} />}
    </div>
  );
}
