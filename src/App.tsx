import {Typography} from '@mui/material';
import * as Sentry from '@sentry/react';
import {useQuery} from '@tanstack/react-query';
import {usePostHog} from 'posthog-js/react';
import React, {Suspense, useEffect, useRef, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import NavBar from '~/components/NavBar';
import LoadingSkeleton from '~/LoadingSkeleton';
import Router from '~/Router';

import {authUrl} from './consts';
import {forgetLoginRedirect, mayRedirectToLogin} from './features/auth/loginRedirectGuard';
import SignInProblem from './features/auth/SignInProblem';
import {userQueryOptions} from './features/auth/useUser';
import CommandPalette from './features/commandpalette/components/CommandPalette';
import DisplayStateProvider from './helpers/DisplayStateProvider';

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

  const needsLogin = (!user && isFetched) || isError;
  const [loginLoop, setLoginLoop] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (user) forgetLoginRedirect(window.sessionStorage);
  }, [user]);

  // The login page is calypso-auth's. A visitor who comes back from it without a user is not sent a
  // second time at once (that would loop, see loginRedirectGuard.ts): they get a message instead.
  useEffect(() => {
    if (!needsLogin || redirected.current) return;
    redirected.current = true;
    if (mayRedirectToLogin(window.sessionStorage)) {
      window.location.href = `${authUrl}/login?redirect_uri=${encodeURIComponent(window.location.href)}`;
    } else {
      setLoginLoop(true);
    }
  }, [needsLogin]);

  if (!user && isPending) {
    return <LoadingSkeleton />;
  }

  if (needsLogin) {
    return loginLoop ? <SignInProblem /> : null;
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
