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
import {Home, LocationOn, Timeline, QueryStats, NotListedLocation} from '@mui/icons-material';
import {Notification, useNotificationOverview} from './hooks/query/useNotificationOverview';
import {SelectionCommand} from './features/commandpalette/components/CommandContext';

function App() {
  const {field, home, location: locationNavigation, station} = useNavigationFunctions();
  const {isMobile} = useBreakpoints();
  const {data: locationData} = useNotificationOverview({
    select: (data) => {
      // remove duplicate ts_id and ts_name
      const uniqueLocIds = new Set();
      const uniqueData = data.filter((item) => {
        if (item.ts_id === -1 || uniqueLocIds.has(item.loc_id)) {
          return false; // Exclude items with ts_id -1 or duplicates
        }
        uniqueLocIds.add(item.loc_id);
        return true;
      });
      return uniqueData;
    },
  });
  const {data: calypsoIDData} = useNotificationOverview({
    select: (data) => {
      // remove duplicate ts_id and ts_name

      const uniqueTsIds = new Set();
      const uniqueData = data
        .filter((item) => item.active && item.calypso_id != null)
        .filter((item) => {
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
      group: 'Generelt',
    },
    {
      id: 'searchLocations',
      name: 'Søg i lokationer',
      type: 'selection',
      perform: (inp) => {
        locationNavigation(inp.loc_id);
      },
      icon: <NotListedLocation />,
      shortcut: 'S',
      options: locationData?.map((item) => ({
        label: item.loc_name,
        value: item,
      })), // This will be populated dynamically
      filter: (value, search) => {
        // Filter function to match loc_name with search term
        return value.loc_name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
      },
      group: 'Generelt',
    } as SelectionCommand<Notification>,
    {
      id: 'searchCalypsoID',
      name: 'Søg i Calypso ID',
      type: 'selection',
      perform: (inp) => {
        station(inp.loc_id, inp.ts_id);
      },
      icon: <QueryStats />,
      shortcut: 'C',
      options: calypsoIDData?.map((item) => ({
        label: `${item.calypso_id} (${item.ts_name})`,
        value: item,
      })), // This will be populated dynamically
      filter: (value, search) => {
        // Filter function to match calypso_id with search term
        return value.calypso_id?.toString().includes(search.toLowerCase()) ? 1 : 0;
      },
      group: 'Generelt',
    } as SelectionCommand<Notification>,
    {
      id: 'openLocation',
      name: 'Åbn lokation via ID',
      type: 'input',
      inputPlaceholder: 'Indtast lokations id...',
      perform: (input) => {
        locationNavigation(Number(input));
      },
      icon: <LocationOn />,
      shortcut: 'L',
      group: 'Generelt',
    },
    {
      id: 'openTimeseries',
      name: 'Åbn tidsserie via ID',
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
      group: 'Generelt',
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
