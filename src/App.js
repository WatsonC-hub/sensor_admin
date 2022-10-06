import React, { useEffect, useState } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnAuntenticatedApp from "./UnauthenticatedApp";

function App() {
  const sessionId = sessionStorage.getItem("session_id");
  const [, setUser] = useState(sessionStorage.getItem("user") || null);

  useEffect(() => {
    fetch("/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }, []);

  if (sessionId === null) {
    return <UnAuntenticatedApp setUser={setUser} />;
  }

  return <AuthenticatedApp setUser={setUser} />;
}

export default App;
