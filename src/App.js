import React, { useState } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnAuntenticatedApp from "./UnauthenticatedApp";

function App() {
  const sessionId = sessionStorage.getItem("session_id");
  const [, setUser] = useState(sessionStorage.getItem("user") || null);

  if (sessionId === null) {
    return <UnAuntenticatedApp setUser={setUser} />;
  }

  return <AuthenticatedApp setUser={setUser} />;
}

export default App;
