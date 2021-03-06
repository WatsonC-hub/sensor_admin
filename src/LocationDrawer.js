import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles, useTheme, withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import LocationContext from "./LocationContext";
import Station from "./pages/station";
import { getStations } from "./api";
import MinimalSelect from "./pages/Location/MinimalSelect";
import { useParams, useHistory } from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar

    justifyContent: "flex-end",
  },
  title: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    //marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

const MyListItem = withStyles({
  root: {
    "&$selected": {
      backgroundColor: "lightseagreen",
      color: "white",
    },
  },
  selected: {},
})(ListItem);

export default function LocationDrawer() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formToShow, setFormToShow] = useState(null);
  const [currStation, setCurrStation] = useState(null);
  const [stationList, setStationList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [selectedLocid, setSelectedLocid] = useState(-1);
  const context = useContext(LocationContext);

  const params = useParams();
  const history = useHistory();
  //context.setLocationId(params.locid);

  console.log("useparams => ", params.locid, " statid: ", params.statid);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const currentStation = (id, stations) => {
    if (stations.length === 0) return null;
    return stations.find((s) => s.stationid + "" === id + "");
    //console.log("current station id =>", id);
    //return stations[0];
  };

  const getSelectedItem = () => {
    if (selectedItem !== -1) return selectedItem;
    return currStation ? currStation.stationid : -1;
  };

  useEffect(() => {
    //let [locId, statId] = context.locationId.split("_");
    let locId = params.locid;
    let statId = params.statid;
    console.log("loc_stat_id : ", statId, "---", locId);
    if (statId) {
      //if location is set from the map, stationId is not known
      setSelectedItem(parseInt(statId));
    }
    getStations(locId, sessionStorage.getItem("session_id")).then((res) => {
      console.log(res);
      if (!statId) {
        statId = res.data.res[0].stationid;
        console.log("selecteditem =>", parseInt(statId));
        setSelectedItem(parseInt(statId));
      }
      setCurrStation(currentStation(statId, res.data.res));
      setStationList(res.data.res);
      console.log(res.data.res);
    });
    setSelectedLocid(locId);
  }, [context.locationId]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position='fixed'
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
        style={{ backgroundColor: "lightseagreen" }}
      >
        <Toolbar>
          {/* <IconButton
            color='inherit'
            aria-label='open drawer'
            onClick={handleDrawerOpen}
            edge='start'
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon style={{ color: "#ffa137" }} />
          </IconButton> */}
          {/* <Typography variant='h6' className={classes.title}>
            {currStation && currStation.properties.stationname}
          </Typography> */}
          <IconButton
            className={classes.backButton}
            color='inherit'
            onClick={
              (e) => history.push("/") //context.setLocationId(-1)
            }
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <MinimalSelect
            locid={selectedLocid}
            stationList={stationList}
            selectedStation={selectedItem}
            setSelectedItem={setSelectedItem}
            setCurrStation={setCurrStation}
            currentStation={currentStation}
          />
        </Toolbar>
      </AppBar>
      {/* <Drawer
        className={classes.drawer}
        variant='persistent'
        anchor='left'
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          {stationList.map((_station, index) => (
            <MyListItem
              key={_station.properties.stationid}
              button
              key={_station.properties.stationid}
              onClick={() => {
                setSelectedItem(_station.properties.stationid);
                setCurrStation(_station);
                //setOpen(false);
              }}
              selected={_station.properties.stationid === selectedItem}
            >
              <ListItemText primary={_station.properties.stationname} />
            </MyListItem>
          ))}
        </List>
        <Divider />
      </Drawer> */}
      <main className={classes.content}>
        <div className={classes.drawerHeader} />
        <Station
          open={open}
          stationId={getSelectedItem()}
          formToShow={formToShow}
          setFormToShow={setFormToShow}
        />
      </main>
    </div>
  );
}
