import {useMediaQuery, useTheme} from '@mui/material';
import React, {useEffect} from 'react';
import {Route, Routes, useLocation} from 'react-router-dom';

// const sensorAdminPromise = import('./pages/admin/SensorAdmin');
// const SensorAdmin = React.lazy(() => sensorAdminPromise);
import Chooser from '~/Chooser';
import NavBar from '~/components/NavBar';
import ScanComponent from '~/components/ScanComponent';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import SensorAdmin from '~/pages/admin/SensorAdmin';
import SensorField from '~/pages/field/SensorField';
import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';
import {authStore} from '~/state/store';

import {useNotificationOverview} from './hooks/query/useNotificationOverview';

const Redirecter = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const {field} = useNavigationFunctions();
  const location = useLocation();
  const [iotAccess, adminAccess] = authStore((state) => [state.iotAccess, state.adminAccess]);

  useNotificationOverview({notifyOnChangeProps: []});

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
