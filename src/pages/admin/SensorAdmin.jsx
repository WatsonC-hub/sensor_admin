import React from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import AdminChooser from "./Overview/AdminChooser";

const SensorAdmin = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminChooser />} />
    </Routes>
  );
};

export default SensorAdmin;
