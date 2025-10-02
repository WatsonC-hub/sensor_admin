import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';

import {RemoveTrailingSlash} from '~/RemoveTrailingSlash';

import {AppContext} from './state/contexts';
import ScanComponent from './components/ScanComponent';
import GuardedHome from './pages/Home';
import GuardedCreateStation from './features/station/components/CreateStation';
import {useUser} from './features/auth/useUser';
import AccessDenied from './accessDenied';
import {QueryStats, LocationOn, Timeline, Home as HomeIcon} from '@mui/icons-material';
import {SelectionCommand} from './features/commandpalette/components/CommandContext';
import {usePageActions} from './features/commandpalette/hooks/usePageActions';
import {Notification} from './hooks/query/useNotificationOverview';
import {useNavigationFunctions} from './hooks/useNavigationFunctions';
import ReleaseNoticeModal from './components/ReleaseNotice';

const Router = () => {
  const user = useUser();
  // early return of no IoT access or borehole access
  // redirect component

  const {home, location: locationNavigation, station} = useNavigationFunctions();

  usePageActions([
    {
      id: 'home',
      name: 'Hjem',
      perform: home,
      icon: <HomeIcon />,
      shortcut: 'H',
      type: 'action',
      group: 'Generelt',
    },
    {
      id: 'searchCalypsoID',
      name: 'Søg i Calypso ID',
      type: 'selection',
      perform: (inp) => {
        locationNavigation(inp.loc_id, true);
        station(inp.ts_id);
      },
      icon: <QueryStats />,
      shortcut: 'C',
      options: [], // This will be populated dynamically
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
        locationNavigation(Number(input), true);
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
          station(tsId, true);
        } else {
          console.error('Invalid timeseries ID:', input);
        }
      },
      icon: <Timeline />,
      shortcut: 'I',
      group: 'Generelt',
    },
  ]);

  if (user && !user?.features?.iotAccess && !user?.features?.boreholeAccess) {
    return <AccessDenied message="Der er manglende rettigheder til at tilgå denne side." />;
  }

  return (
    <>
      <RemoveTrailingSlash />
      <ReleaseNoticeModal />
      <Routes>
        <Route
          path="/"
          element={
            <AppContext.Provider value={{}}>
              <GuardedHome />
            </AppContext.Provider>
          }
        />
        <Route
          path="stamdata"
          element={
            <AppContext.Provider value={{}}>
              <GuardedCreateStation />
            </AppContext.Provider>
          }
        />
        <Route path="/:labelid" element={<ScanComponent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default Router;
