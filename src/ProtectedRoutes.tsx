import React from 'react';
import {Navigate, Outlet, useLocation} from 'react-router-dom';

import {authStore} from './state/store';

const ProtectedRoutes = () => {
  const location = useLocation();
  const authenticated = authStore((state) => state.authenticated);

  return authenticated ? <Outlet /> : <Navigate to="/login" replace state={{from: location}} />;
};

export default ProtectedRoutes;
