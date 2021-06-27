import React, { useState, useContext, useRef, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Tooltip from "@material-ui/core/Tooltip";
import MapIcon from "@material-ui/icons/Map";
import TableChart from "@material-ui/icons/TableChart";
import TabPanel from "./TabPanel";
import Map from "../Map";
import Table from "../Table";
import DevExTable from "../DevExTable";
import LocationContext from "../LocationContext";
import { Button } from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import IconButton from "@material-ui/core/IconButton";
import StationList from "../pages/overview/StationList";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import axios from "axios";
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

const logout = () => {
  let sessionUrl = "https://watsonc.admin.gc2.io/api/v2/session/stop";
  return axios.get(sessionUrl);
};

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

export default function SimpleTabs(props) {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const locationContext = useContext(LocationContext);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [containerRef, isTabVisible] = useElementVisible({
    root: null,
    rootMargin: "0px",
    threshold: 1.0,
  });

  const handleChange = (event, newValue) => {
    //setValue(newValue);
    locationContext.setTabValue(newValue);
  };

  const handleLogout = () => {
    props.setToken(null);
  };

  const goToMap = () => setValue(1);
  const goToTable = () => setValue(0);

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
      {/* <AppBar position='static' style={{ backgroundColor: "lightseagreen" }}>
        
      </AppBar> */}
      {/* <AppBar position='static' style={{ backgroundColor: "lightseagreen" }}> */}
      {/* <Toolbar style={{ flexGrow: 1, flexDirection: "row-reverse" }}>
          <Button color='inherit' onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar> */}
      {/* <AppBar position='sticky' style={{ backgroundColor: "white" }}> */}
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
      {/* </AppBar> */}
      <TabPanel value={locationContext.tabValue} index={0}>
        {/* <DevExTable {...props} /> */}
        {matches ? <StationList /> : <DevExTable {...props} />}
      </TabPanel>
      <TabPanel value={locationContext.tabValue} index={1}>
        <Map data={props.sensors} />
      </TabPanel>
      {matches && !isTabVisible && (
        <Scroll scrollBelow={100} className={classes.fab} />
      )}
    </div>
  );
}
