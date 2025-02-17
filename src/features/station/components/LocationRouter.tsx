import AddIcon from '@mui/icons-material/Add';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {Alert, Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import {useQueryClient} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';

import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
import BatteryStatus from '~/features/station/components/BatteryStatus';
import {metadataQueryOptions, useMetadata} from '~/hooks/query/useMetadata';
import useStationList from '~/hooks/query/useStationList';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import LoadingSkeleton from '~/LoadingSkeleton';
import ErrorPage from '~/pages/field/station/ErrorPage';
import Station from '~/pages/field/station/Station';
import {useAppContext} from '~/state/contexts';
import {useAuthStore} from '~/state/store';

import MinimalSelect from './MinimalSelect';

export default function LocationRouter() {
  const queryClient = useQueryClient();
  const {loc_id, ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const {createStamdata, adminKvalitetssikring} = useNavigationFunctions();
  const adminAccess = useAuthStore((state) => state.adminAccess);
  const {data: ts_list} = useStationList(loc_id);
  const {metadata, pending} = useMetadata();
  const loc_name = metadata && 'loc_name' in metadata ? metadata.loc_name : '';
  const calculated = metadata && 'calculated' in metadata ? metadata.calculated : undefined;

  if (pending) return <LoadingSkeleton />;

  if (ts_list && ts_list.length > 0)
    ts_list.forEach((item) => {
      queryClient.prefetchQuery(metadataQueryOptions(item.ts_id));
    });

  if (ts_list && ts_list.length === 0) {
    return (
      <Box
        display={'flex'}
        alignSelf={'center'}
        flexDirection={'column'}
        marginX={'auto'}
        maxWidth={400}
        gap={2}
        marginY={4}
      >
        <Alert
          severity={'info'}
          sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
        >
          <Typography>
            Der er ingen tidsserie og/eller udstyr tilknyttet denne lokation. Tryk på knappen
            nedenfor for at påbegynde oprettelse af tidsserie og/eller tilknytning af udstyr
          </Typography>
        </Alert>
        <Button
          bttype="primary"
          onClick={() => {
            createStamdata(ts_id ? '2' : '1', {
              state: {
                ...metadata,
              },
            });
          }}
        >
          Opret tidsserie og/eller udstyr
        </Button>
      </Box>
    );
  }

  // if (ts_id == undefined && ts_list && ts_list.length > 0) return '';

  return (
    <>
      <CssBaseline />
      <NavBar>
        <NavBar.GoBack />
        <Box display="block" flexGrow={1} overflow="hidden">
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {loc_name}
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
              ...(adminAccess && ts_id && calculated
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
                  createStamdata(undefined, {state: {...metadata}});
                },
              },
            ]}
          />
        </Box>
      </NavBar>

      <main style={{flexGrow: 1}}>
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          {ts_id && <Station />}
        </ErrorBoundary>
      </main>
    </>
  );
}
