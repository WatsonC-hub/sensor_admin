import React, { useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import "./App.css";
import { useTheme } from "@material-ui/core/styles";
import SimpleTabs from "./components/SimpleTabs";
import LocationDrawer from "./pages/station/LocationDrawer";
import AppBar from "@material-ui/core/AppBar";
import IconButton from "@material-ui/core/IconButton";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";
import { PhotoCameraRounded } from "@material-ui/icons";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import ScanComponent from "./components/ScanComponent";
import OpretStamdata from "./pages/Stamdata/OpretStamdata";
import { StamdataProvider } from "./pages/Stamdata/StamdataContext";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import LocationContext from "./context/LocationContext";
import CaptureDialog from "./pages/station/CaptureDialog";

/*
Libraries to explore for this app:
- react-query => for http requests instead of fetch, 
- hapi/joy => schema validation (joy.dev)
- react/route or reach-router
- test azure web apps
*/

function AuthenticatedApp({ setUser }) {
  const [, setSessionId] = useState(null);
  const [locationId, setLocationId] = useState(-1);
  const [stationId, setStationId] = useState(-1);
  const [tabValue, setTabValue] = useState(0);
  const [addStationDisabled, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const history = useHistory();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
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

  return (
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
      <div className="App">
        <CaptureDialog open={open} handleClose={handleClose} />
        <AppBar position="sticky">
          <Toolbar
            style={{
              flexGrow: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {location.pathname !== "/stamdata" ? (
              <Button
                disabled={addStationDisabled}
                color="secondary"
                variant="contained"
                onClick={() => {
                  history.push("/stamdata");
                  //setAddStationDisabled(true);
                }}
              >
                Opret station
              </Button>
            ) : (
              <IconButton
                color="inherit"
                onClick={
                  (e) => history.push("/") //context.setLocationId(-1)
                }
              >
                <KeyboardBackspaceIcon />
              </IconButton>
            )}

            {matches && (
              <IconButton color="inherit" onClick={handleClickOpen}>
                <PhotoCameraRounded />
              </IconButton>
            )}

            <Button
              color="secondary"
              variant="contained"
              onClick={handleLogout}
            >
              Log ud
            </Button>
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path="/" exact>
            <SimpleTabs setUser={setUser} />
          </Route>
          <Route path="/location/:locid/:statid">
            <LocationDrawer />
          </Route>
          <Route path="/location/:locid">
            <LocationDrawer />
          </Route>
          <Route path="/stamdata">
            <StamdataProvider>
              <OpretStamdata setAddStationDisabled={setAddStationDisabled} />
            </StamdataProvider>
          </Route>
          <Route path="/:labelid">
            <ScanComponent />
          </Route>
        </Switch>
      </div>
    </LocationContext.Provider>
  );
}

export default AuthenticatedApp;
