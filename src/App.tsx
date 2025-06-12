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
import {Home, LocationOn, Timeline} from '@mui/icons-material';
import {useNotificationOverview} from './hooks/query/useNotificationOverview';

function App() {
  const {field, home, location: locationNavigation, station} = useNavigationFunctions();
  const {isMobile} = useBreakpoints();
  const {data} = useNotificationOverview({
    select: (data) => {
      // remove duplicate ts_id and ts_name
      const uniqueTsIds = new Set();
      const uniqueData = data.filter((item) => {
        if (item.ts_id === -1 || uniqueTsIds.has(item.ts_id)) {
          return false; // Exclude items with ts_id -1 or duplicates
        }
        uniqueTsIds.add(item.ts_id);
        return true;
      });
      return uniqueData;
    },
  });
  const user = useUser();

  usePageActions([
    {
      id: 'home',
      name: 'Hjem',
      perform: home,
      icon: <Home />,
      shortcut: 'H',
      type: 'action',
    },
    {
      id: 'openLocation',
      name: 'Åbn lokation (ID)',
      type: 'input',
      inputPlaceholder: 'Indtast lokations id...',
      perform: (input) => {
        locationNavigation(Number(input));
      },
      icon: <LocationOn />,
      shortcut: 'L',
    },
    {
      id: 'openTimeseries',
      name: 'Åbn tidsserie (ID)',
      type: 'input',
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
      id: 'searchTimeseries',
      name: 'Søg i tidsserier',
      type: 'selection',
      perform: (input) => {
        const tsId = Number(input);
        if (tsId) {
          station(undefined, tsId);
        } else {
          console.error('Invalid timeseries ID:', input);
        }
      },
      icon: <Timeline />,
      shortcut: 'S',
      options: data?.map((item) => ({
        label: item.ts_name,
        value: item.ts_id?.toString(),
      })), // This will be populated dynamically
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
