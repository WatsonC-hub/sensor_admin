import React, { useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
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

function SensorField({}) {
  const [locationId, setLocationId] = useState(-1);
  const [stationId, setStationId] = useState(-1);
  const [tabValue, setTabValue] = useState(0);
  const [addStationDisabled, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
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
                  navigate("stamdata");
                  //setAddStationDisabled(true);
                }}
              >
                Opret station
              </Button>
            ) : (
              <IconButton
                color="inherit"
                onClick={
                  (e) => navigate("/") //context.setLocationId(-1)
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

            <Button color="grey" variant="contained" onClick={handleLogout}>
              Log ud
            </Button>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<SimpleTabs />} />
          <Route path="/location/:locid/:statid" element={<LocationDrawer />} />
          <Route path="/location/:locid" element={<LocationDrawer />} />
          <Route
            path="stamdata"
            element={
              <OpretStamdata setAddStationDisabled={setAddStationDisabled} />
            }
          />
          <Route path="/:labelid" element={<ScanComponent />} />
        </Routes>
      </div>
    </LocationContext.Provider>
  );
}

export default SensorField;
