import React, { useState, useContext, useRef, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Tooltip from "@material-ui/core/Tooltip";
import MapIcon from "@material-ui/icons/Map";
import TableChart from "@material-ui/icons/TableChart";
import TabPanel from "./TabPanel";
import Map from "../pages/overview/Map";
import StationListDesktop from "../pages/overview/StationListDesktop";
import LocationContext from "../context/LocationContext";
import StationList from "../pages/overview/StationList";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Scroll from "./Scroll";
import { getTableData } from "../api";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

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
  const classes = useStyles();
  const locationContext = useContext(LocationContext);
  const theme = useTheme();
  console.log(theme.breakpoints);
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const [containerRef, isTabVisible] = useElementVisible({
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  });
  const [data, setData] = useState([]);

  useEffect(() => {
    getTableData(sessionStorage.getItem("session_id")).then((res) => {
      setData(res.data.result);
    });
  }, []);

  const handleChange = (_, newValue) => {
    locationContext.setTabValue(newValue);
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
        value={locationContext.tabValue}
        onChange={handleChange}
        variant="fullWidth"
        aria-label="simple tabs example"
        ref={containerRef}
      >
        <Tab icon={TableIcon} />
        <Tab icon={KortIcon} />
      </Tabs>
      <TabPanel value={locationContext.tabValue} index={0}>
        {matches ? (
          <StationList data={data} />
        ) : (
          <StationListDesktop data={data} />
        )}
      </TabPanel>
      <TabPanel value={locationContext.tabValue} index={1}>
        <Map />
      </TabPanel>
      {matches && !isTabVisible && (
        <Scroll scrollBelow={100} className={classes.fab} />
      )}
    </div>
  );
}
