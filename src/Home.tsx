import React from 'react';
import {Route, Routes} from 'react-router-dom';

import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import TasksPage from './pages/admin/opgaver/TasksPage';
import OpretStamdata from './pages/field/stamdata/OpretStamdata';
import {AppContext} from './state/contexts';
import ScanComponent from './components/ScanComponent';

const Home = () => {
  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route
          path="/"
          element={
            <AppContext.Provider value={{}}>
              <TasksPage />
            </AppContext.Provider>
          }
        />
        <Route
          path="stamdata"
          element={
            <AppContext.Provider value={{}}>
              <OpretStamdata />
            </AppContext.Provider>
          }
        />
        <Route
          path="*"
          element={
            <AppContext.Provider value={{}}>
              <TasksPage />
            </AppContext.Provider>
          }
        />
        <Route path="/:labelid" element={<ScanComponent />} />
      </Routes>
    </>
  );
};

export default Home;
