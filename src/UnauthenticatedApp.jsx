import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Login/Register";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

export default function UnAuntenticatedApp({}) {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login />} />
      <Route path="/:labelid" element={<Login />} />
    </Routes>
  );
}
