import React from "react";
import Login from "./pages/Login/Login";

export default function UnAuntenticatedApp({ setToken }) {
  return <Login setToken={setToken} />;
}
