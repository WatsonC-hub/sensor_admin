import React, { useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
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
import { useAtom } from "jotai";
import { captureDialogAtom } from "./state/atoms";

function SensorField({}) {
  const [locationId, setLocationId] = useState(-1);
  const [stationId, setStationId] = useState(-1);
  const [tabValue, setTabValue] = useState(0);
  const [addStationDisabled, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useAtom(captureDialogAtom);
  const theme = useTheme();
  const navigate = useNavigate();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [setAuthenticated, setUser, setSessionId] = authStore((state) => [
    state.setAuthenticated,
    state.setUser,
    state.setSessionId,
  ]);

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
        <Routes>
          <Route path="/" element={<SimpleTabs />} />
          <Route path="location/:locid/:statid" element={<LocationDrawer />} />
          <Route path="location/:locid" element={<LocationDrawer />} />
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
