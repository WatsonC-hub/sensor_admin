import React, {useEffect, useState, Suspense} from 'react';

import UnAuntenticatedApp from './UnauthenticatedApp';
import {authStore} from './state/store';
import LoadingSkeleton from './LoadingSkeleton';
import {apiClient} from './apiClient';
import Redirecter from './Redirecter';
import NavBar from './NavBar';
import {ErrorBoundary} from 'react-error-boundary';
import {Typography} from '@mui/material';

function App() {
  const [authenticated] = authStore((state) => [state.authenticated]);

  useEffect(() => {
    apiClient.get('/auth/me/secure').then((res) => {
      console.log(res);
    });
    const ele = document.getElementById('ipl-progress-indicator');
    if (ele) {
      // fade out
      ele.classList.add('available');
      setTimeout(() => {
        // remove from DOM
        ele.outerHTML = '';
      }, 2000);
    }
  }, []);

  console.log('authenticated => ', authenticated);

  if (!authenticated) {
    return (
      <>
        <NavBar />
        <UnAuntenticatedApp />
      </>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={() => (
        <>
          <NavBar />
          <Typography variant="h4" component="h1" sx={{textAlign: 'center', mt: 5}}>
            Noget gik galt. Prøver at genindlæse siden.
          </Typography>
        </>
      )}
      onError={(error, componentStack) => {
        if (error.message.includes('Failed to fetch dynamically imported module')) {
          // window.location.reload(true);
        }
      }}
    >
      <Suspense fallback={<LoadingSkeleton />}>
        <Redirecter />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
