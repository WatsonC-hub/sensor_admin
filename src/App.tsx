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
import CommandPalette from './features/commandpalette/components/CommandPalette';
import {usePageActions} from './features/commandpalette/hooks/usePageActions';
import {Home, Link, LocationOn, Timeline} from '@mui/icons-material';

function App() {
  const {field, home, location: locationNavigation, station} = useNavigationFunctions();
  const {isMobile} = useBreakpoints();
  const user = useUser();

  usePageActions([
    {
      id: 'openLocation',
      name: 'Åbn lokation',
      input: true,
      inputPlaceholder: 'Indtast lokation...',
      perform: (input) => {
        locationNavigation(Number(input));
      },
      icon: <LocationOn />,
      shortcut: 'L',
    },
    {
      id: 'openTimeseries',
      name: 'Åbn tidsserie',
      input: true,
      inputPlaceholder: 'Indtast tidsserie ID...',
      perform: (input) => {
        const tsId = Number(input);
        if (tsId) {
          station(undefined, tsId);
        } else {
          console.error('Invalid timeseries ID:', input);
        }
      },
      icon: <Timeline />,
      shortcut: 'I',
    },
    {
      id: 'field',
      name: 'Gå til marken',
      perform: field,
      icon: <Link />,
    },
    {
      id: 'home',
      name: 'Hjem',
      perform: home,
      icon: <Home />,
      shortcut: 'H',
    },
  ]);

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
      <CommandPalette />
    </ErrorBoundary>
  );
}

export default App;
