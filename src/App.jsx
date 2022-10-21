import React, { useEffect, useState } from "react";
import AuthenticatedApp from "./AuthenticatedApp";
import UnAuntenticatedApp from "./UnauthenticatedApp";
import { authStore } from "./state/store";

function App() {
  const [authenticated] = authStore((state) => [state.authenticated]);

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

  console.log("authenticated => ", authenticated);
  if (!authenticated) {
    return <UnAuntenticatedApp />;
  }

  return <AuthenticatedApp />;
}

export default App;
