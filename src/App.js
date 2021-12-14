import React, { useState } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnAuntenticatedApp from "./UnauthenticatedApp";
import { ThemeProvider, createTheme } from "@material-ui/core";

const theme = createTheme({
  darkgreen: "rgb(0,120,109)",
});

function App() {
  const sessionId = sessionStorage.getItem("session_id");
  const [, setUser] = useState(sessionStorage.getItem("user") || null);

  if (sessionId === null) {
    return <UnAuntenticatedApp setUser={setUser} />;
  }

  return <AuthenticatedApp setUser={setUser} />;
}

export default App;
