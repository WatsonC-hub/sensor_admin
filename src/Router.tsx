import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';

import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import {AppContext} from './state/contexts';
import ScanComponent from './components/ScanComponent';
import GuardedHome from './pages/Home';
import GuardedCreateStation from './features/station/components/CreateStation';
import {useUser} from './features/auth/useUser';
import AccessDenied from './accessDenied';

const Router = () => {
  const user = useUser();
  // early return of no IoT access or borehole access
  // redirect component

  if (!user.features.iotAccess && !user.features.boreholeAccess) {
    return <AccessDenied message="Der er manglende rettigheder til at tilgå denne side." />;
  }

  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route
          path="/"
          element={
            <AppContext.Provider value={{}}>
              <GuardedHome />
            </AppContext.Provider>
          }
        />
        <Route
          path="stamdata"
          element={
            <AppContext.Provider value={{}}>
              <GuardedCreateStation />
            </AppContext.Provider>
          }
        />
        <Route path="/:labelid" element={<ScanComponent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default Router;
