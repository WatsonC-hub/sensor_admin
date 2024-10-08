import React from 'react';
import {Route, Routes} from 'react-router-dom';

import Login from '~/pages/login/Login';

export default function UnAuntenticatedApp() {
  return (
    <Routes>
      {/* <Route path="/register" element={<Register />} /> */}
      <Route path="*" element={<Login />} />
      <Route path="/:labelid" element={<Login />} />
    </Routes>
  );
}
