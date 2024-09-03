import {Typography} from '@mui/material';
import React, {Suspense, useEffect, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import {apiClient} from '~/apiClient';
import NavBar from '~/components/NavBar';
import {authStore} from '~/state/store';

import LoadingSkeleton from './LoadingSkeleton';
import Redirecter from './Redirecter';
import UnAuntenticatedApp from './UnauthenticatedApp';

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated, setLoginExpired, setAuthorization] = authStore(
    (state) => [
      state.authenticated,
      state.setAuthenticated,
      state.setLoginExpired,
      state.setAuthorization,
    ]
  );

  useEffect(() => {
    apiClient
      .get('/auth/me/secure')
      .then((res) => {
        setAuthorization(res.data);
        setAuthenticated(true);
        setLoginExpired(false);
      })
      .finally(() => setLoading(false));
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

  if (loading) {
    return <LoadingSkeleton />;
  }

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
