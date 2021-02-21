import React, { useEffect, useState } from "react";
import "./App.css";
import { getSensorData } from "./api";
import SimpleTabs from "./components/SimpleTabs";
import LocationDrawer from "./LocationDrawer";
import LocationContext from "./LocationContext";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";

/*
Libraries to explore for this app:
- react-query => for http requests instead of fetch, 
- hapi/joy => schema validation (joy.dev)
- react/route or reach-router
*/

function AuthenticatedApp({ setUser }) {
  const [sensors, setSensors] = useState([]);
  const [userId, setUserId] = useState(0);
  const [locationId, setLocationId] = useState(-1);
  const [stationId, setStationId] = useState(-1);
  const [tabValue, setTabValue] = useState(0);

  const handleLogout = () => {
    sessionStorage.removeItem("sessionId");
    setUser(null);
  };

  useEffect(() => {
    getSensorData().then((res) => {
      setSensors(res.data);
    });
  }, [userId]);

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
        <AppBar position='static' style={{ backgroundColor: "lightseagreen" }}>
          <Toolbar style={{ flexGrow: 1, flexDirection: "row-reverse" }}>
            <Button color='inherit' onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        {locationId === -1 ? (
          <SimpleTabs sensors={sensors} setUser={setUser} />
        ) : (
          <LocationDrawer />
        )}
      </div>
    </LocationContext.Provider>
  );
}

export default AuthenticatedApp;
