import React from 'react';
import {Route, Routes} from 'react-router-dom';

import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import TasksPage from './pages/admin/opgaver/TasksPage';
import {AppContext} from './state/contexts';
import CreateStation from './features/station/components/CreateStation';

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
              <CreateStation />
            </AppContext.Provider>
          }
        />
      </Routes>
    </>
  );
};

export default Home;
