import React, {useEffect, useState, Suspense} from 'react';

// import AuthenticatedApp from "./AuthenticatedApp";
// import SensorField from "./SensorField";
import UnAuntenticatedApp from './UnauthenticatedApp';
import {authStore} from './state/store';
import LoadingSkeleton from './LoadingSkeleton';
import {apiClient} from './apiClient';
import Redirecter from './Redirecter';
import NavBar from './NavBar';

function App() {
  const [authenticated] = authStore((state) => [state.authenticated]);

  useEffect(() => {
    apiClient.get('/auth/me/secure').then((res) => {
      console.log(res);
    });
  }, []);

  console.log('authenticated => ', authenticated);
  const sensorFieldPromise = import('./pages/field/SensorField');
  const SensorField = React.lazy(() => sensorFieldPromise);

  // TODO:
  // 1. Added token expiration check

  if (!authenticated) {
    return (
      <>
        <NavBar />
        <UnAuntenticatedApp />
      </>
    );
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <Redirecter SensorField={SensorField} />
    </Suspense>
  );
}

export default App;
