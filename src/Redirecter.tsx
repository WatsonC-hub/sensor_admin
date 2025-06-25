import React, {useEffect} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import {useNotificationOverview} from './hooks/query/useNotificationOverview';
import {useUser} from './features/auth/useUser';
import Home from './pages/Home';

const Redirecter = () => {
  const {home} = useNavigationFunctions();
  const location = useLocation();
  const user = useUser();

  useNotificationOverview({notifyOnChangeProps: []});

  useEffect(() => {
    if (!user && location.pathname !== '/') {
      home();
    }
  }, [user]);

  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="stamdata"
          element={
            <>
              <Navigate to={'/field'} replace />
            </>
          }
        />

        {/* <Route
          path="/field/*"
          element={
            <>
              <SensorField />
            </>
          }
        />

        <Route path="/:labelid" element={<ScanComponent />} />*/}
        <Route
          path="*"
          element={
            <>
              <Navigate to={'/'} replace />
            </>
          }
        />
      </Routes>
    </>
  );
};

export default Redirecter;
