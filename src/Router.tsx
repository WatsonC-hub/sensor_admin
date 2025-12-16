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
import {useNavigationFunctions} from './hooks/useNavigationFunctions';
import ReleaseNoticeModal from './components/ReleaseNotice';
import useCmdPalette, {CommandPalette} from './hooks/query/useCmdPalette';

const Router = () => {
  const user = useUser();
  // early return of no IoT access or borehole access
  // redirect component

  const {home, location: locationNavigation, station} = useNavigationFunctions();

  const {
    get: {data: calypsoIDData},
  } = useCmdPalette({
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
      options: calypsoIDData?.map((item) => ({
        label: `${item.calypso_id} (${item.ts_name})`,
        value: item,
      })), // This will be populated dynamically
      filter: (value, search) => {
        // Filter function to match calypso_id with search term
        return value.calypso_id?.toString().includes(search.toLowerCase()) ? 1 : 0;
      },
      group: 'Generelt',
    } as SelectionCommand<CommandPalette>,
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
      type: 'selection',
      inputPlaceholder: 'Indtast tidsserie ID...',
      options: calypsoIDData?.map((item) => ({
        label: `${item.ts_id}`,
        value: item,
      })),
      filter: (value, search) => {
        return value.ts_id?.toString().includes(search.toLowerCase()) ? 1 : 0;
      },
      perform: (input) => {
        const tsId = Number(input.ts_id);
        const locId = Number(input.loc_id);
        locationNavigation(locId, true);
        station(tsId);
      },
      icon: <Timeline />,
      shortcut: 'I',
      group: 'Generelt',
    } as SelectionCommand<CommandPalette>,
  ]);

  if (!user.features.iotAccess && !user.features.boreholeAccess) {
    return (
      <AccessDenied message="Du har hverken IoT-adgang eller adgang til pejleboringer. Kontakt venligst WatsonC, hvis du ønsker opsætning af IoT-stationer eller pejleboringer, eller hvis du mener, dette er en fejl" />
    );
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
