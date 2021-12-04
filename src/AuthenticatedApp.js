import React, { useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import "./App.css";
import SimpleTabs from "./components/SimpleTabs";
import LocationDrawer from "./LocationDrawer";
import LocationContext from "./LocationContext";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";

import ScanComponent from "./components/ScanComponent";
import OpretStamdata from "./pages/Stamdata/OpretStamdata";
import { StamdataProvider } from "./pages/Stamdata/StamdataContext";

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
  const history = useHistory();

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
      <div className='App'>
        <AppBar position='sticky' style={{ backgroundColor: "lightseagreen" }}>
          <Toolbar
            style={{
              flexGrow: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Button
              disabled={addStationDisabled}
              color='inherit'
              style={{ backgroundColor: "#4472c4" }}
              onClick={() => {
                history.push("/stamdata");
                setAddStationDisabled(true);
              }}
            >
              Tilføj Station
            </Button>
            <Button color='inherit' onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Switch>
          <Route path='/' exact>
            <SimpleTabs setUser={setUser} />
          </Route>
          <Route path='/location/:locid/:statid'>
            <LocationDrawer />
          </Route>
          <Route path='/location/:locid'>
            <LocationDrawer />
          </Route>
          <Route path='/stamdata'>
            <StamdataProvider>
              <OpretStamdata setAddStationDisabled={setAddStationDisabled} />
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