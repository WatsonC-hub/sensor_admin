import React, { useEffect, useState, Suspense } from "react";
const authenticatedAppPromise = import("./AuthenticatedApp");
const AuthenticatedApp = React.lazy(() => authenticatedAppPromise);
// import AuthenticatedApp from "./AuthenticatedApp";
import UnAuntenticatedApp from "./UnauthenticatedApp";
import { authStore } from "./state/store";
import LoadingSkeleton from "./LoadingSkeleton";

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

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AuthenticatedApp />
    </Suspense>
  );
}

export default App;
