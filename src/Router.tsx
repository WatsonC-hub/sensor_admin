import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';

import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import Home from './pages/admin/opgaver/Home';
import {AppContext} from './state/contexts';
import CreateStation from './features/station/components/CreateStation';
import ScanComponent from './components/ScanComponent';

const Router = () => {
  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route
          path="/"
          element={
            <AppContext.Provider value={{}}>
              <Home />
            </AppContext.Provider>
          }
        />
        <Route
          path="stamdata"
          element={
            <AppContext.Provider value={{}}>
              <CreateStation />
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
