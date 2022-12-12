import React, {useState} from 'react';
import {Route, Routes} from 'react-router-dom';
import OverviewPage from './Overview/OverviewPage';
import LocationRouter from './Station/LocationRouter';
import ScanComponent from '../../components/ScanComponent';
import OpretStamdata from './Stamdata/OpretStamdata';
import CaptureDialog from './Station/CaptureDialog';
import {useAtom} from 'jotai';
import {captureDialogAtom} from '../../state/atoms';
import BoreholeRouter from './Boreholeno/BoreholeRouter';

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
        <Route path="/" element={<OverviewPage />} />
        <Route path="location/:locid/:statid" element={<LocationRouter />} />
        <Route path="location/:locid" element={<LocationRouter />} />
        <Route
          path="stamdata"
          element={<OpretStamdata setAddStationDisabled={setAddStationDisabled} />}
        />
        <Route path="/:labelid" element={<ScanComponent />} />
        <Route path="borehole/:boreholeno/:intakeno" element={<BoreholeRouter />} />
        <Route path="borehole/:boreholeno" element={<BoreholeRouter />} />
      </Routes>
    </div>
  );
}

export default SensorField;
