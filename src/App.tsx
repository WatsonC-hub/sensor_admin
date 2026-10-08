import {Typography} from '@mui/material';
import * as Sentry from '@sentry/react';
import {useQuery} from '@tanstack/react-query';
import {usePostHog} from 'posthog-js/react';
import React, {Suspense, useEffect, useRef, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import NavBar from '~/components/NavBar';
import LoadingSkeleton from '~/LoadingSkeleton';
import Router from '~/Router';

import {forgetLoginRedirect, wasJustSentToLogin} from './features/auth/loginRedirectGuard';
import SignedOut from './features/auth/SignedOut';
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
  // The login page is calypso-auth's. A visitor without a user presses "Log ind" (SignedOut) to go there.
  // One who comes back from it still without a user gets a message instead of another round (that
  // would loop, see loginRedirectGuard.ts). That is only a visitor who has not had a user on this page:
  // one who signs out here (no reload) was not sent anywhere, however recently they signed in (a
  // passkey login takes only a few seconds, so the mark from the click on "Log ind" can still be fresh).
  const [loginLoop, setLoginLoop] = useState(false);
  const hadUser = useRef(false);

  useEffect(() => {
    if (user) {
      hadUser.current = true;
      forgetLoginRedirect(window.sessionStorage);
    }
  }, [user]);

  if (!user && isPending) {
    return <LoadingSkeleton />;
  }

  if (needsLogin) {
    const backFromLogin = loginLoop || (!hadUser.current && wasJustSentToLogin(window.sessionStorage));
    return backFromLogin ? <SignInProblem /> : <SignedOut onLoginLoop={() => setLoginLoop(true)} />;
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
