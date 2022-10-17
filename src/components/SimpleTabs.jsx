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

const tabAtom = atom(0);

const useElementVisible = (options) => {
  const containerRef = useRef(null);
  const [isTabVisible, setIsTabVisible] = useState(false);

  const callbackFunction = (entries) => {
    const [entry] = entries;
    setIsTabVisible(entry.isIntersecting);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [containerRef, options]);

  return [containerRef, isTabVisible];
};

export default function SimpleTabs() {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [tabValue, setTabValue] = useAtom(tabAtom);
  const [containerRef, isTabVisible] = useElementVisible({
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  });

  const { data, isLoading } = useQuery(
    ["station_list"],
    () => getTableData(sessionStorage.getItem("session_id")),
    {
      refetchInterval: 120000,
    }
  );

  const { data: mapData, isLoading: mapLoading } = useQuery(
    ["map_data"],
    () => getSensorData(sessionStorage.getItem("session_id")),
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
        ref={containerRef}
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
      {/* {matches && !isTabVisible && (
        <Scroll scrollBelow={100} sx/>
      )} */}
    </div>
  );
}
