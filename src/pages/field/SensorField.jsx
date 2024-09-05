import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {Route, Routes} from 'react-router-dom';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import CaptureDialog from '~/components/CaptureDialog';
import ScanComponent from '~/components/ScanComponent';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import BoreholeRouter from '~/pages/field/boreholeno/BoreholeRouter';
import OverviewPage from '~/pages/field/overview/OverviewPage';
import OpretStamdata from '~/pages/field/stamdata/OpretStamdata';
import LocationRouter from '~/pages/field/station/LocationRouter';
import {captureDialogAtom} from '~/state/atoms';

function SensorField() {
  const [, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useAtom(captureDialogAtom);

  async function getData(labelid) {
    const {data} = await apiClient.get(`/sensor_field/calypso_id/${labelid}`);
    return data;
  }

  const {location, station, borehole, boreholeIntake} = useNavigationFunctions();

  const handleClose = () => {
    setOpen(false);
  };

  const handleScan = async (data) => {
    const split = data['text'].split('/');
    const calypso_id = split[split.length - 1];

    const options = {replace: true};

    try {
      const resp = await getData(calypso_id);

      if (resp.loc_id) {
        if (resp.ts_id) {
          // navigate(`/field/location/${resp.loc_id}/${resp.ts_id}`, {replace: true});
          station(resp.loc_id, resp.ts_id, options);
        } else {
          // navigate(`/field/location/${resp.loc_id}`, {replace: true});
          location(resp.loc_id, options);
        }
      } else if (resp.boreholeno) {
        if (resp.intakeno) {
          // navigate(`/field/borehole/${resp.boreholeno}/${resp.intakeno}`, {replace: true});
          boreholeIntake(resp.boreholeno, resp.intakeno, options);
        } else {
          // navigate(`/field/borehole/${resp.boreholeno}`, {replace: true});
          borehole(resp.boreholeno, options);
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

  console.log('rerender field');
  return (
    <div className="App">
      {open && <CaptureDialog open={open} handleClose={handleClose} handleScan={handleScan} />}
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="location/:locid/:ts_id" element={<LocationRouter />} />
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
