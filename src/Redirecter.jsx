import React, {Suspense} from 'react';
import {Route, Routes, useNavigate, useLocation} from 'react-router-dom';
const sensorAdminPromise = import('./pages/admin/SensorAdmin');
const SensorAdmin = React.lazy(() => sensorAdminPromise);
// const sensorFieldPromise = import("./SensorField");
// const SensorField = React.lazy(() => sensorFieldPromise);
import LoadingSkeleton from './LoadingSkeleton';
import NavBar from './NavBar';
import Chooser from './Chooser';

const Redirecter = ({SensorField}) => {
  const navigate = useNavigate();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <Chooser />
            </>
          }
        />
        <Route
          path="/field/*"
          element={
            <>
              <NavBar />
              <SensorField />
            </>
          }
        />
        <Route
          path="/admin/*"
          element={
            <>
              <NavBar />
              <SensorAdmin />
            </>
          }
        />
      </Routes>
    </>
  );
};

export default Redirecter;
