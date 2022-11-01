import React, { Suspense } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
const sensorFieldPromise = import("./SensorField");
const SensorField = React.lazy(() => sensorFieldPromise);

const AppChooser = () => {
  const navigate = useNavigate();

  return (
    <>
      <p>what up</p>
      <button onClick={() => navigate("/field")}>Sensor</button>
      <Routes>
        <Route
          path="/field*"
          element={
            <Suspense>
              <SensorField />
            </Suspense>
          }
        />
        <Route path="/admin*" element={<div>Admin</div>} />
      </Routes>
    </>
  );
};

export default AppChooser;
