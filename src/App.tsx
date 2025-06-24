import {Typography} from '@mui/material';
import * as Sentry from '@sentry/react';
import React, {Suspense, useEffect} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import NavBar from '~/components/NavBar';
import LoadingSkeleton from '~/LoadingSkeleton';
import Redirecter from '~/Redirecter';
import UnAuntenticatedApp from '~/UnauthenticatedApp';

import useBreakpoints from './hooks/useBreakpoints';
import {useNavigationFunctions} from './hooks/useNavigationFunctions';
import {useUser} from './features/auth/useUser';
import {usePostHog} from 'posthog-js/react';

function App() {
  const {field} = useNavigationFunctions();
  const posthog = usePostHog();

  const {isMobile} = useBreakpoints();
  const user = useUser();

  useEffect(() => {
    if (isMobile && location.pathname == '/') {
      field();
    }
  }, [isMobile]);

  useEffect(() => {
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

  useEffect(() => {
    if (user) {
      posthog.identify(user.user_id.toString(), {
        isSuperAdmin: user.superUser,
      });
      if (user.org_id) posthog.group('organization', user.org_id.toString());
    } else {
      posthog.reset();
    }
  }, [user, posthog]);

  if (user === undefined) {
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
        <Redirecter />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
