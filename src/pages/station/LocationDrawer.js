import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { useTheme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import LocationContext from "../../state/LocationContext";
import Station from "./Station";
import { getStations } from "../../api";
import MinimalSelect from "../Location/MinimalSelect";
import { useParams, useHistory } from "react-router-dom";
import { StamdataProvider } from "../../state/StamdataContext";

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

export default function LocationDrawer() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [formToShow, setFormToShow] = useState(null);
  const [currStation, setCurrStation] = useState(null);
  const [stationList, setStationList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [selectedLocid, setSelectedLocid] = useState(-1);
  const context = useContext(LocationContext);

  const theme = useTheme();
  const params = useParams();
  const history = useHistory();

  const currentStation = (id, stations) => {
    if (stations.length === 0) return null;
    return stations.find((s) => s.ts_id + "" === id + "");
  };

  useEffect(() => {
    let locId = params.locid;
    let statId = params.statid;
    if (statId) {
      setSelectedItem(parseInt(statId));
    }
    getStations(locId, sessionStorage.getItem("session_id")).then((res) => {
      if (!statId) {
        statId = -1;
        if (res.data.res.length === 1) {
          setCurrStation(res.data.res[0]);
          statId = res.data.res[0].ts_id;
          history.replace(`/location/${locId}/${statId}`);
        }
        setSelectedItem(parseInt(statId));
      } else {
        setCurrStation(currentStation(statId, res.data.res));
      }
      setStationList(res.data.res);
    });
    setSelectedLocid(locId);
  }, [context.locationId]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
        style={{ backgroundColor: theme.palette.primary }}
      >
        <Toolbar>
          <IconButton
            className={classes.backButton}
            color="inherit"
            onClick={(e) => history.push("/")}
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <MinimalSelect
            locid={selectedLocid}
            stationList={stationList}
            selectedStation={selectedItem}
            setSelectedItem={setSelectedItem}
            setCurrStation={setCurrStation}
            currentStation={currStation}
          />
        </Toolbar>
      </AppBar>

      <main className={classes.content}>
        <div className={classes.drawerHeader} />
        <StamdataProvider>
          <Station
            open={open}
            stationId={currStation ? currStation.ts_id : -1}
            formToShow={formToShow}
            setFormToShow={setFormToShow}
          />
        </StamdataProvider>
      </main>
    </div>
  );
}
