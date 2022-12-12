import React, {useEffect, useState} from 'react';
import {Route, Routes, useNavigate, useLocation} from 'react-router-dom';
const sensorAdminPromise = import('./pages/admin/SensorAdmin');
const SensorAdmin = React.lazy(() => sensorAdminPromise);
import {authStore} from './state/store';
import LoadingSkeleton from './LoadingSkeleton';
import NavBar from './NavBar';
import Chooser from './Chooser';

const Redirecter = ({SensorField}) => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [iotAccess] = authStore((state) => [state.iotAccess]);

  useEffect(() => {
    if (!iotAccess) {
      navigate('/field');
    }
    setAuthChecked(true);
  }, [iotAccess]);

  // USE THIS FOR TEMP PRODUCTION AND COMMENT OUT ALL OTHER THAN FIELD ROUTES
  // useEffect(() => {
  //   navigate('/field');
  // }, []);

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
      </Routes>
    </>
  );
};

export default Redirecter;
