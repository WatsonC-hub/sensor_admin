import React, { useState } from "react";
import { Route, Switch, useHistory, useLocation } from "react-router-dom";
import "./App.css";
import { useTheme } from "@mui/material/styles";
import SimpleTabs from "./components/SimpleTabs";
import LocationDrawer from "./pages/station/LocationDrawer";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@mui/material";
import { PhotoCameraRounded } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";

import ScanComponent from "./components/ScanComponent";
import OpretStamdata from "./pages/Stamdata/OpretStamdata";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import LocationContext from "./state/LocationContext";
import CaptureDialog from "./pages/station/CaptureDialog";
import { authStore } from "./state/store";

/*
Libraries to explore for this app:
- react-query => for http requests instead of fetch, 
- hapi/joy => schema validation (joy.dev)
- react/route or reach-router
- test azure web apps
*/

function AuthenticatedApp({}) {
  const [locationId, setLocationId] = useState(-1);
  const [stationId, setStationId] = useState(-1);
  const [tabValue, setTabValue] = useState(0);
  const [addStationDisabled, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const history = useHistory();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [setAuthenticated, setUser, setSessionId] = authStore((state) => [
    state.setAuthenticated,
    state.setUser,
    state.setSessionId,
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    // sessionStorage.removeItem("session_id");
    // sessionStorage.removeItem("user");
    setAuthenticated(false);
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
        {open && <CaptureDialog open={open} handleClose={handleClose} />}
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
                size="large"
              >
                <KeyboardBackspaceIcon />
              </IconButton>
            )}

            {matches && (
              <IconButton
                color="inherit"
                onClick={handleClickOpen}
                size="large"
              >
                <PhotoCameraRounded />
              </IconButton>
            )}

            <Button
              color="grey"
              variant="contained"
              onClick={handleLogout}
            >
              Log ud
            </Button>
          </Toolbar>
        </AppBar>
        <Switch>
          <Route path="/" exact>
            <SimpleTabs />
          </Route>
          <Route path="/location/:locid/:statid">
            <LocationDrawer />
          </Route>
          <Route path="/location/:locid">
            <LocationDrawer />
          </Route>
          <Route path="/stamdata">
            <OpretStamdata setAddStationDisabled={setAddStationDisabled} />
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
