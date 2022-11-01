import React, { useEffect, useState, Suspense } from "react";
const sensorFieldPromise = import("./SensorField");
const SensorField = React.lazy(() => sensorFieldPromise);
// import AuthenticatedApp from "./AuthenticatedApp";
import UnAuntenticatedApp from "./UnauthenticatedApp";
import { authStore } from "./state/store";
import LoadingSkeleton from "./LoadingSkeleton";
import { apiClient } from "./api";
import AppChooser from "./AppChooser";

function App() {
  const [authenticated] = authStore((state) => [state.authenticated]);

  useEffect(() => {
    apiClient.get("/auth/me/secure").then((res) => {
      console.log(res);
    });
  }, []);

  console.log("authenticated => ", authenticated);

  // TODO:
  // 1. Added token expiration check

  if (!authenticated) {
    return <UnAuntenticatedApp />;
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AppChooser />
    </Suspense>
  );
}

export default App;
