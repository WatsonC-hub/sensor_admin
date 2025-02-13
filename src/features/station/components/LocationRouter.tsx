import AddIcon from '@mui/icons-material/Add';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {ErrorBoundary} from 'react-error-boundary';

import NavBar from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
import BatteryStatus from '~/features/station/components/BatteryStatus';
import {useMetadata} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import ErrorPage from '~/pages/field/station/ErrorPage';
import Station from '~/pages/field/station/Station';
import {useAppContext} from '~/state/contexts';
import {useAuthStore} from '~/state/store';

import MinimalSelect from './MinimalSelect';

export default function LocationRouter() {
  const {ts_id} = useAppContext([], ['ts_id']);
  const {createStamdata, adminKvalitetssikring} = useNavigationFunctions();
  const adminAccess = useAuthStore((state) => state.adminAccess);

  const {metadata} = useMetadata();
  return (
    <>
      <CssBaseline />
      <NavBar>
        <NavBar.GoBack />
        <Box display="block" flexGrow={1} overflow="hidden">
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {metadata?.loc_name}
          </Typography>
          <MinimalSelect />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <BatteryStatus />
          <NavBar.Home />
          {adminAccess && <NotificationList />}
          <NavBar.Menu
            highligtFirst={false}
            items={[
              ...(adminAccess && !metadata?.calculated
                ? [
                    {
                      title: 'Til QA',
                      onClick: () => {
                        adminKvalitetssikring(ts_id ?? -1);
                      },
                      icon: <AutoGraphIcon />,
                    },
                  ]
                : []),
              {
                title: 'Opret tidsserie',
                icon: <AddIcon />,
                onClick: () => {
                  console.log('station', metadata);
                  console.log('ts_id', ts_id);
                  createStamdata(undefined, {
                    state: {
                      ...metadata,
                    },
                  });
                },
              },
            ]}
          />
        </Box>
      </NavBar>

      <main style={{flexGrow: 1}}>
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          <Station />
        </ErrorBoundary>
      </main>
    </>
  );
}
