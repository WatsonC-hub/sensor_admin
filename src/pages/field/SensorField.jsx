import React, {useState} from 'react';
import {Route, Routes, useNavigate} from 'react-router-dom';
import OverviewPage from './Overview/OverviewPage';
import LocationRouter from './Station/LocationRouter';
import ScanComponent from '../../components/ScanComponent';
import OpretStamdata from './Stamdata/OpretStamdata';
import CaptureDialog from 'src/components/CaptureDialog';
import {useAtom} from 'jotai';
import {captureDialogAtom} from '../../state/atoms';
import BoreholeRouter from './Boreholeno/BoreholeRouter';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';

function SensorField({}) {
  const [addStationDisabled, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useAtom(captureDialogAtom);

  async function getData(labelid) {
    const {data} = await apiClient.get(`/sensor_field/calypso_id/${labelid}`);
    return data;
  }

  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
  };

  const handleScan = async (data) => {
    const split = data['text'].split('/');
    const calypso_id = split[split.length - 1];

    try {
      const resp = await getData(calypso_id);

      if (resp.loc_id) {
        if (resp.ts_id) {
          navigate(`/field/location/${resp.loc_id}/${resp.ts_id}`, {replace: true});
        } else {
          navigate(`/field/location/${resp.loc_id}`, {replace: true});
        }
      } else if (resp.boreholeno) {
        if (resp.intakeno) {
          navigate(`/field/borehole/${resp.boreholeno}/${resp.intakeno}`, {replace: true});
        } else {
          navigate(`/field/borehole/${resp.boreholeno}`, {replace: true});
        }
      } else {
        toast.error('Ukendt fejl', {
          autoClose: 2000,
        });
      }
      handleClose();
    } catch (e) {
      console.log(e);
      toast.error(e.response?.data?.detail ? e.response?.data?.detail : 'Ukendt fejl', {
        autoClose: 2000,
      });
      handleClose();
    }
  };

  return (
    <div className="App">
      {open && <CaptureDialog open={open} handleClose={handleClose} handleScan={handleScan} />}
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
