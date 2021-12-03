import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import "./App.css";
import { getSensorData } from "./api";
import SimpleTabs from "./components/SimpleTabs";
import Login from "./pages/Login/Login";
import LocationDrawer from "./LocationDrawer";
import LocationContext from "./LocationContext";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { PhotoCameraRounded } from "@material-ui/icons";
import CaptureDialog from "./pages/station/CaptureDialog";
import ScanComponent from "./components/ScanComponent";
import OpretForm from "./pages/Stamdata/OpretForm";
import { StamdataProvider } from "./pages/Stamdata/StamdataContext";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";

/*
Libraries to explore for this app:
- react-query => for http requests instead of fetch, 
- hapi/joy => schema validation (joy.dev)
- react/route or reach-router
- test azure web apps
*/

function AuthenticatedApp({ setUser }) {
  const [sensors, setSensors] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [locationId, setLocationId] = useState(-1);
  const [stationId, setStationId] = useState(-1);
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [addStationDisabled, setAddStationDisabled] = useState(false);
  const history = useHistory();
  let location = useLocation();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("session_id");
    setSessionId(null);
    setUser(null);
  };

  // if (history.location.pathname !== '/stamdata') {
  //   setAddStationDisabled(false)
  // }
  console.log(location.pathname)
  console.log(location.pathname !== '/stamdata')

  // useEffect(() => {
  //   let sessionId = sessionStorage.getItem("session_id");

  //   getSensorData(sessionId).then((res) => {
  //     setSensors(res.data);
  //   });
  // }, []);

  return sessionStorage.getItem("session_id") === null ? (
    <Login setUser={setUser} />
  ) : (
    <LocationContext.Provider
      value={{
        locationId,
        setLocationId,
        stationId,
        setStationId,
        tabValue,
        setTabValue,
      }}
    >
      <div className='App'>
        {/* <CaptureDialog open={open} handleClose={handleClose} /> */}
        <AppBar position='sticky' style={{ backgroundColor: "lightseagreen" }}>
          <Toolbar
            style={{
              flexGrow: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            { (location.pathname !== '/stamdata') ? <Button
              color='inherit'
              style={{ backgroundColor: "#4472c4" }}
              onClick={() => {
                history.push("/stamdata");
                // setAddStationDisabled(true);
              }}
            >
              Opret station
            </Button> :  <IconButton
            color='inherit'
            onClick={
              (e) => history.push("/") //context.setLocationId(-1)
            }
          >
            <KeyboardBackspaceIcon />
          </IconButton>}
            <Button color='inherit' onClick={handleLogout}>
              Log ud
            </Button>
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path='/' exact>
            <SimpleTabs sensors={sensors} setUser={setUser} />
          </Route>
          <Route path='/location/:locid/:statid'>
            <LocationDrawer />
          </Route>
          <Route path='/location/:locid'>
            <LocationDrawer />
          </Route>
          <Route path='/stamdata'>
            <StamdataProvider>
              <OpretForm setAddStationDisabled={setAddStationDisabled} />
            </StamdataProvider>
          </Route>
          <Route path='/:labelid'>
            <ScanComponent />
          </Route>
        </Switch>
      </div>
    </LocationContext.Provider>
  );
}

export default AuthenticatedApp;
