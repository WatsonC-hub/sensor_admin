import {Typography} from '@mui/material';
import * as Sentry from '@sentry/react';
import React, {Suspense, useEffect} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import NavBar from '~/components/NavBar';
import LoadingSkeleton from '~/LoadingSkeleton';
import Router from '~/Router';
import UnAuntenticatedApp from '~/UnauthenticatedApp';

import {userQueryOptions} from './features/auth/useUser';
import {usePostHog} from 'posthog-js/react';
import DisplayStateProvider from './helpers/DisplayStateProvider';
import {useQuery} from '@tanstack/react-query';
import CommandPalette from './features/commandpalette/components/CommandPalette';

function App() {
  const posthog = usePostHog();
  // const user = useUser();

  const {data: user, isPending, isFetched, isError} = useQuery(userQueryOptions);

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

  if (!user && isPending) {
    return <LoadingSkeleton />;
  }

  if ((!user && isFetched) || isError) {
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
        Sentry.captureException(error);
      }}
    >
      <Suspense fallback={<LoadingSkeleton />}>
        <DisplayStateProvider>
          <Router />
        </DisplayStateProvider>
      </Suspense>
      <CommandPalette />
    </ErrorBoundary>
  );
}

export default App;
