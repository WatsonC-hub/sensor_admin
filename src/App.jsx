import React, {Suspense, useEffect} from 'react';

import {Typography} from '@mui/material';
import {ErrorBoundary} from 'react-error-boundary';
import LoadingSkeleton from './LoadingSkeleton';
import NavBar from './NavBar';
import Redirecter from './Redirecter';
import UnAuntenticatedApp from './UnauthenticatedApp';
import {apiClient} from './apiClient';
import {authStore} from './state/store';

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

  // Check if csrf token is in url params and set it in local storage and remove it from url

  const urlParams = new URLSearchParams(window.location.search);
  const csrfToken = urlParams.get('csrf_token');
  if (csrfToken) {
    window.localStorage.setItem('calypso_csrf_token', csrfToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  useEffect(() => {
    apiClient.get('/auth/me/secure').then((res) => {
      setAuthorization(res.data);
      setAuthenticated(true);
      setLoginExpired(false);
      window.localStorage.setItem('calypso_csrf_token', res.data.csrf_token);
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
