import React, {useEffect, useState} from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';
// const sensorAdminPromise = import('./pages/admin/SensorAdmin');
// const SensorAdmin = React.lazy(() => sensorAdminPromise);
import ScanComponent from 'src/components/ScanComponent';
import Chooser from './Chooser';
import LoadingSkeleton from './LoadingSkeleton';
import NavBar from './NavBar';
import SensorAdmin from './pages/admin/SensorAdmin';
import SensorField from './pages/field/SensorField';
import {authStore} from './state/store';

const Redirecter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [iotAccess, adminAccess] = authStore((state) => [state.iotAccess, state.adminAccess]);

  useEffect(() => {
    if (!iotAccess && location.pathname == '/') {
      navigate('/field');
    }
    setAuthChecked(true);
  }, [iotAccess]);

  // USE THIS FOR TEMP PRODUCTION AND COMMENT OUT ALL OTHER THAN FIELD ROUTES
  // useEffect(() => {
  //   navigate('/field');
  // }, []);

  useEffect(() => {
    if (!adminAccess && location.pathname == '/') {
      navigate('/field');
    }
  }, [adminAccess]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              {authChecked ? <Chooser /> : <LoadingSkeleton />}
            </>
          }
        />
        <Route
          path="/field/*"
          element={
            <>
              <NavBar />
              <SensorField />
            </>
          }
        />
        <Route
          path="/admin/*"
          element={
            <>
              <NavBar />
              <SensorAdmin />
            </>
          }
        />
        <Route path="/:labelid" element={<ScanComponent />} />
      </Routes>
    </>
  );
};

export default Redirecter;
