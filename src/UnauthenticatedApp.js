import React from "react";
import Login from "./pages/Login/Login";

export default function UnAuntenticatedApp({ setUser }) {
  return <Login setUser={setUser} />;
}
