import React, {useEffect} from 'react';
import {Route, Routes, useLocation} from 'react-router-dom';
import NavBar from '~/components/NavBar';
import ScanComponent from '~/components/ScanComponent';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import SensorField from '~/pages/field/SensorField';
import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import {useNotificationOverview} from './hooks/query/useNotificationOverview';
import {useUser} from './features/auth/useUser';

const Redirecter = () => {
  const {field} = useNavigationFunctions();
  const location = useLocation();
  const user = useUser();

  useNotificationOverview({notifyOnChangeProps: []});
  useEffect(() => {
    if (user && !user.iotAccess && location.pathname == '/') {
      // navigate('/field');
      field();
    }
  }, [user?.iotAccess]);

  useEffect(() => {
    if (user && !user.adminAccess && location.pathname == '/') {
      // navigate('/field');
      field();
    }
  }, [user?.adminAccess]);

  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar>
                <NavBar.Logo />
              </NavBar>
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

        <Route path="/:labelid" element={<ScanComponent />} />
      </Routes>
    </>
  );
};

export default Redirecter;
