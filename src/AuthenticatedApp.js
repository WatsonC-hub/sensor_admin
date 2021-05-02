import React, { useEffect, useState } from "react";
import "./App.css";
import { getSensorData } from "./api";
import SimpleTabs from "./components/SimpleTabs";
import LocationDrawer from "./LocationDrawer";
import LocationContext from "./LocationContext";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { PhotoCameraRounded } from "@material-ui/icons";
import CaptureDialog from "./pages/station/CaptureDialog";

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
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("session_id");
    setUser(null);
  };

  useEffect(() => {
    let sessionId = sessionStorage.getItem("session_id");
    getSensorData(sessionId).then((res) => {
      setSensors(res.data);
    });
  }, []);

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
        <CaptureDialog open={open} handleClose={handleClose} />
        <AppBar position='static' style={{ backgroundColor: "lightseagreen" }}>
          <Toolbar
            style={{
              flexGrow: 1,
              // flexDirection: "row-reverse",
              justifyContent: "space-between",
            }}
          >
            <IconButton color='inherit' onClick={handleClickOpen}>
              <PhotoCameraRounded />
            </IconButton>
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
