import {Typography} from '@mui/material';
import * as Sentry from '@sentry/react';
import React, {Suspense, useEffect} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import NavBar from '~/components/NavBar';
import LoadingSkeleton from '~/LoadingSkeleton';
import Router from '~/Router';
import UnAuntenticatedApp from '~/UnauthenticatedApp';

import useBreakpoints from './hooks/useBreakpoints';
import {useNavigationFunctions} from './hooks/useNavigationFunctions';
import {useUser, userQueryOptions} from './features/auth/useUser';
import DisplayStateProvider from './helpers/DisplayStateProvider';
import {useQuery} from '@tanstack/react-query';

function App() {
  const {home} = useNavigationFunctions();
  const {isMobile} = useBreakpoints();
  const user = useUser();
  const {isLoading} = useQuery(userQueryOptions);

  useEffect(() => {
    if (isMobile && location.pathname == '/') {
      home();
    }
  }, [isMobile]);

  useEffect(() => {
    // prefetch user
    const ele = document.getElementById('ipl-progress-indicator');
    if (ele) {
      // fade out
      ele.classList.add('available');
      setTimeout(() => {
        // remove from DOM
        // ele.outerHTML = '';
      }, 2000);
    }
  }, []);

  if (user === undefined || isLoading) {
    return <LoadingSkeleton />;
  }

  if (user === null) {
    return (
      <>
        <NavBar>
          <NavBar.Logo />
        </NavBar>
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
      onError={(error) => {
        console.error('application crash', error);
        Sentry.captureException(error);
        if (error.message.includes('Failed to fetch dynamically imported module')) {
          // window.location.reload(true);
        }
      }}
    >
      <Suspense fallback={<LoadingSkeleton />}>
        <DisplayStateProvider>
          <Router />
        </DisplayStateProvider>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
