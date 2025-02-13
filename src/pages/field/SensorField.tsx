import {useAtom} from 'jotai';
import React, {useState} from 'react';
import {Route, Routes} from 'react-router-dom';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import CaptureDialog from '~/components/CaptureDialog';
import ScanComponent from '~/components/ScanComponent';
import LocationRouter from '~/features/station/components/LocationRouter';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import BoreholeRouter from '~/pages/field/boreholeno/BoreholeRouter';
import OverviewPage from '~/pages/field/overview/OverviewPage';
import OpretStamdata from '~/pages/field/stamdata/OpretStamdata';
import {captureDialogAtom} from '~/state/atoms';
import BoreholeRouterProvider from '~/state/BoreholeRouterProvider';
import CreateStamdataProvider from '~/state/CreateStamdataProvider';
import StationRouterProvider from '~/state/StationRouterProvider';

function SensorField() {
  const [, setAddStationDisabled] = useState(false);
  const [open, setOpen] = useAtom(captureDialogAtom);

  async function getData(labelid: string) {
    const {data} = await apiClient.get(`/sensor_field/calypso_id/${labelid}`);
    return data;
  }

  const {location, station, borehole, boreholeIntake} = useNavigationFunctions();

  const handleClose = () => {
    setOpen(false);
  };

  const handleScan = async (data: any) => {
    const split = data[0]['rawValue'].split('/');
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
    } catch (e: any) {
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
        <Route
          path="location/:locid/:ts_id"
          element={
            <StationRouterProvider>
              <LocationRouter />
            </StationRouterProvider>
          }
        />
        <Route
          path="location/:locid"
          element={
            <StationRouterProvider>
              <LocationRouter />
            </StationRouterProvider>
          }
        />
        <Route
          path="stamdata"
          element={
            <CreateStamdataProvider>
              <OpretStamdata setAddStationDisabled={setAddStationDisabled} />
            </CreateStamdataProvider>
          }
        />
        <Route path="/:labelid" element={<ScanComponent />} />
        <Route
          path="borehole/:boreholeno/:intakeno"
          element={
            <BoreholeRouterProvider>
              <BoreholeRouter />
            </BoreholeRouterProvider>
          }
        />
        <Route
          path="borehole/:boreholeno"
          element={
            <BoreholeRouterProvider>
              <BoreholeRouter />
            </BoreholeRouterProvider>
          }
        />
      </Routes>
    </div>
  );
}

export default SensorField;
