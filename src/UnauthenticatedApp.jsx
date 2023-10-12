import React from 'react';
import {Route, Routes} from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Login/Register';

export default function UnAuntenticatedApp({}) {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login />} />
      <Route path="/:labelid" element={<Login />} />
    </Routes>
  );
}
