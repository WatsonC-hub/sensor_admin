import AddIcon from '@mui/icons-material/Add';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import {useQuery} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';
import {Navigate, useNavigate} from 'react-router-dom';

import {apiClient} from '~/apiClient';
import {AppBarLayout, NavBarMenu, HomeButton} from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
import BatteryStatus from '~/features/station/components/BatteryStatus';
import MinimalSelect from '~/features/station/components/MinimalSelect';
import {useMetadata} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import LoadingSkeleton from '~/LoadingSkeleton';
import ErrorPage from '~/pages/field/station/ErrorPage';
import Station from '~/pages/field/station/Station';
import {MetadataContext} from '~/state/contexts';
import {authStore} from '~/state/store';

interface LocationRouterProps {
  loc_id: string;
  ts_id?: string;
}

export default function LocationRouter({loc_id, ts_id}: LocationRouterProps) {
  const navigate = useNavigate();
  const {createStamdata, adminKvalitetssikring} = useNavigationFunctions();
  const adminAccess = authStore((state) => state.adminAccess);

  const {data, error, isPending} = useQuery({
    queryKey: ['stations', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
      return data;
    },
    enabled: loc_id !== undefined,
  });

  const {data: metadata} = useMetadata(ts_id ? parseInt(ts_id) : -1);

  if (isPending)
    return (
      <>
        <CssBaseline />
        <AppBarLayout>
          <IconButton
            color="inherit"
            onClick={() => {
              navigate(-1);
            }}
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <NavBarMenu />
        </AppBarLayout>
        <LoadingSkeleton />
      </>
    );
  if (error) return;

  let hasTimeseries = undefined;
  if (data.length > 0)
    hasTimeseries = data.some((stamdata: {ts_id: number}) => stamdata.ts_id !== null);
  let stamdata = undefined;
  if (hasTimeseries) {
    stamdata = data.filter((elem: {ts_id: number}) => ts_id && elem.ts_id == parseInt(ts_id))?.[0];
  } else {
    stamdata = data[0];
  }

  if (data.length == 1 && ts_id === undefined && data[0].ts_id != null) {
    return (
      <>
        <CssBaseline />
        <AppBarLayout>
          <IconButton
            color="inherit"
            onClick={() => {
              navigate(-1);
            }}
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <NavBarMenu />
        </AppBarLayout>
        <LoadingSkeleton />
        <Navigate to={`../location/${loc_id}/${data[0].ts_id}`} replace />;
      </>
    );
  }

  return (
    <MetadataContext.Provider value={metadata}>
      <CssBaseline />
      <AppBarLayout>
        <IconButton
          color="inherit"
          onClick={() => {
            navigate(-1);
          }}
          size="large"
        >
          <KeyboardBackspaceIcon />
        </IconButton>

        <Box display="block" flexGrow={1} overflow="hidden">
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {data?.[0].loc_name}
          </Typography>
          {hasTimeseries ? (
            <MinimalSelect locid={loc_id ? parseInt(loc_id) : undefined} stationList={data} />
          ) : hasTimeseries === false ? (
            'Ingen tidsserie på lokationen'
          ) : (
            ''
          )}
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <BatteryStatus ts_id={ts_id ? ts_id : ''} />
          <HomeButton />
          {adminAccess && <NotificationList />}
          <NavBarMenu
            highligtFirst={false}
            items={[
              ...(adminAccess && !stamdata?.calculated
                ? [
                    {
                      title: 'Til QA',
                      onClick: () => {
                        adminKvalitetssikring(ts_id ? parseInt(ts_id) : -1);
                      },
                      icon: <AutoGraphIcon />,
                    },
                  ]
                : []),
              {
                title: 'Opret tidsserie',
                icon: <AddIcon />,
                onClick: () => {
                  createStamdata();
                },
              },
            ]}
          />
        </Box>
      </AppBarLayout>

      <main
        style={{
          flexGrow: 1,
        }}
      >
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          <Station ts_id={ts_id ? parseInt(ts_id) : -1} stamdata={stamdata} />
        </ErrorBoundary>
      </main>
    </MetadataContext.Provider>
  );
}
