import React from 'react';
import {Route, Routes} from 'react-router-dom';

import Login from '~/pages/login/Login';
import Register from '~/pages/login/Register';

export default function UnAuntenticatedApp({}) {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login />} />
      <Route path="/:labelid" element={<Login />} />
    </Routes>
  );
}
