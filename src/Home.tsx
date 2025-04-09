import React from 'react';
import {Route, Routes} from 'react-router-dom';

import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import TasksPage from './pages/admin/opgaver/TasksPage';
import OpretStamdata from './pages/field/stamdata/OpretStamdata';
import {AppContext} from './state/contexts';

const Home = () => {
  return (
    <>
      <RemoveTrailingSlash />
      <Routes>
        <Route path="/" element={<TasksPage />} />
        <Route
          path="stamdata"
          element={
            <AppContext.Provider value={{}}>
              <OpretStamdata />
            </AppContext.Provider>
          }
        />
      </Routes>
    </>
  );
};

export default Home;
