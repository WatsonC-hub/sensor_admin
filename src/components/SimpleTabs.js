import React, { useState, useContext, useRef, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Tooltip from "@material-ui/core/Tooltip";
import MapIcon from "@material-ui/icons/Map";
import TableChart from "@material-ui/icons/TableChart";
import TabPanel from "./TabPanel";
import Map from "../Map";
import DevExTable from "../DevExTable";
import LocationContext from "../LocationContext";
import StationList from "../pages/overview/StationList";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Scroll from "./Scroll";

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
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [containerRef, isTabVisible] = useElementVisible({
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  });

  const handleChange = (_, newValue) => {
    locationContext.setTabValue(newValue);
  };

  const KortIcon = (
    <Tooltip title='Kort'>
      <MapIcon />
    </Tooltip>
  );

  const TableIcon = (
    <Tooltip title='Tabel'>
      <TableChart />
    </Tooltip>
  );

  return (
    <div>
      <Tabs
        value={locationContext.tabValue}
        onChange={handleChange}
        variant='fullWidth'
        aria-label='simple tabs example'
        tabItemContainerStyle={{ position: "fixed", bottom: "0" }}
        ref={containerRef}
      >
        <Tab icon={TableIcon} />
        <Tab icon={KortIcon} />
      </Tabs>
      <TabPanel value={locationContext.tabValue} index={0}>
        {matches ? <StationList /> : <DevExTable />}
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
