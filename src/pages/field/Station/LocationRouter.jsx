import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {useQuery} from '@tanstack/react-query';
import {useEffect} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {useNavigate, useParams} from 'react-router-dom';
import {AppBarLayout, NavBarMenu} from '~/components/NavBar';
import {apiClient} from '~/apiClient';
import {useNotificationOverview} from '~/hooks/query/useNotificationOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {authStore} from '~/state/store';
import NotificationList from '../../../components/NotificationList';
import ErrorPage from './ErrorPage';
import MinimalSelect from './MinimalSelect';
import Station from '~/pages/field/Station/Station';
import {useMetadata} from '~/hooks/query/useMetadata';
import {MetadataContext} from '~/state/contexts';

export default function LocationRouter() {
  const params = useParams();
  const navigate = useNavigate();
  const adminAccess = authStore((state) => state.adminAccess);

  const {isMobile} = useBreakpoints();

  const {data: notificationOverview} = useNotificationOverview();

  const {data} = useQuery({
    queryKey: ['stations', params.locid],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${params.locid}`);
      return data;
    },
    enabled: params.locid !== undefined,
  });

  useEffect(() => {
    if (data && params.ts_id === undefined) {
      navigate(`../location/${params.locid}/${data[0].ts_id}`, {
        replace: true,
      });
    }
  }, [data]);

  const {data: metadata} = useMetadata(params.ts_id);

  const stamdata = data?.filter((elem) => elem.ts_id == params.ts_id)?.[0];

  return (
    <MetadataContext.Provider value={metadata}>
      <CssBaseline />
      <AppBarLayout>
        <IconButton
          color="inherit"
          onClick={(e) => {
            navigate(-1);
          }}
          size="large"
        >
          <KeyboardBackspaceIcon />
        </IconButton>

        <Box display="block" flexGrow={1} overflow="hidden">
          <Tooltip title={data?.[0].loc_name} arrow enterTouchDelay={0}>
            <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
              {data?.[0].loc_name}
            </Typography>
          </Tooltip>
          <MinimalSelect locid={params.locid} stationList={data} />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          {adminAccess && <NotificationList />}
          <NavBarMenu
            highligtFirst={!isMobile}
            items={[
              ...(adminAccess && !stamdata?.calculated
                ? [
                    {
                      title: 'Til QA',
                      onClick: () => {
                        navigate(`/admin/kvalitetssikring/${params.ts_id}`);
                      },
                      icon: <AutoGraphIcon />,
                    },
                  ]
                : []),
            ]}
          />
        </Box>
      </AppBarLayout>

      <main
        style={{
          flexGrow: 1,
          // padding: theme.spacing(0.5),
        }}
      >
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          <Station ts_id={params.ts_id ? params.ts_id : -1} stamdata={stamdata} />
        </ErrorBoundary>
      </main>
    </MetadataContext.Provider>
  );
}
