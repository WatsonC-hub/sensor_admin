import React, {Suspense, useEffect} from 'react';

import {Typography} from '@mui/material';
import {ErrorBoundary} from 'react-error-boundary';
import LoadingSkeleton from './LoadingSkeleton';
import NavBar from '~/components/NavBar';
import Redirecter from './Redirecter';
import UnAuntenticatedApp from './UnauthenticatedApp';
import {apiClient} from '~/apiClient';
import {authStore} from '~/state/store';

function App() {
  // const [authenticated] = authStore((state) => [state.authenticated]);
  const [authenticated, setAuthenticated, setLoginExpired, setAuthorization] = authStore(
    (state) => [
      state.authenticated,
      state.setAuthenticated,
      state.setLoginExpired,
      state.setAuthorization,
    ]
  );

  const urlParams = new URLSearchParams(window.location.search);

  useEffect(() => {
    apiClient.get('/auth/me/secure').then((res) => {
      setAuthorization(res.data);
      setAuthenticated(true);
      setLoginExpired(false);
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
