import {useMediaQuery, useTheme} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {Route, Routes, useLocation, useNavigate} from 'react-router-dom';

// const sensorAdminPromise = import('./pages/admin/SensorAdmin');
// const SensorAdmin = React.lazy(() => sensorAdminPromise);
import NavBar from '~/components/NavBar';
import ScanComponent from '~/components/ScanComponent';

import Chooser from './Chooser';
import {useNavigationFunctions} from './hooks/useNavigationFunctions';
import LoadingSkeleton from './LoadingSkeleton';
import SensorAdmin from './pages/admin/SensorAdmin';
import SensorField from './pages/field/SensorField';
import {RemoveTrailingSlash} from './RemoveTrailingSlash';
import {authStore} from './state/store';

const Redirecter = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const {field} = useNavigationFunctions();
  const location = useLocation();
  const [iotAccess, adminAccess] = authStore((state) => [state.iotAccess, state.adminAccess]);

  useEffect(() => {
    if (!iotAccess && location.pathname == '/') {
      // navigate('/field');
      field();
    }
  }, [iotAccess]);

  useEffect(() => {
    if (matches && location.pathname == '/') {
      // navigate('/field');
      field();
    }
  }, [matches]);

  useEffect(() => {
    if (!adminAccess && location.pathname == '/') {
      // navigate('/field');
      field();
    }
  }, [adminAccess]);

  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <Chooser />
            </>
          }
        />
        <Route
          path="/field/*"
          element={
            <>
              <SensorField />
            </>
          }
        />
        <Route
          path="/admin/*"
          element={
            <>
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
