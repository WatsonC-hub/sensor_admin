import React, {useEffect} from 'react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import {useNotificationOverview} from './hooks/query/useNotificationOverview';
import {useUser} from './features/auth/useUser';
import TasksPage from './pages/admin/opgaver/TasksPage';

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
        <Route path="/" element={<TasksPage />} />
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
      </Routes>
    </>
  );
};

export default Redirecter;
