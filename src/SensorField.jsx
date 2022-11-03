import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import SimpleTabs from "./components/SimpleTabs";
import LocationDrawer from "./pages/station/LocationDrawer";

import ScanComponent from "./components/ScanComponent";
import OpretStamdata from "./pages/Stamdata/OpretStamdata";
import CaptureDialog from "./pages/station/CaptureDialog";
import { authStore } from "./state/store";
import { useAtom } from "jotai";
import { captureDialogAtom } from "./state/atoms";
// import BoreholeDraw from "./pages/Boreholeno/BoreholeDraw";

function SensorField({}) {
  const [addStationDisabled, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useAtom(captureDialogAtom);

  const handleClose = () => {
    setOpen(false);
  };

  return (
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
        {/* <Route
          path="borehole/:boreholeno/:intakeno"
          element={<BoreholeDraw />}
        />
        <Route path="borehole/:boreholeno" element={<BoreholeDraw />} /> */}
      </Routes>
    </div>
  );
}

export default SensorField;
