import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
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

import {apiClient} from '~/apiClient';
import {AppBarLayout, NavBarMenu, HomeButton} from '~/components/NavBar';
import {useMetadata} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import Station from '~/pages/field/station/Station';
import {MetadataContext} from '~/state/contexts';
import {authStore} from '~/state/store';

import NotificationList from '../../../components/NotificationList';

import ErrorPage from './ErrorPage';
import MinimalSelect from './MinimalSelect';

export default function LocationRouter() {
  const params = useParams();
  const navigate = useNavigate();
  const {station, createStamdata, adminKvalitetssikring} = useNavigationFunctions();
  const adminAccess = authStore((state) => state.adminAccess);

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
      station(params.locid, data[0].ts_id, {replace: true});
      // navigate(`../location/${params.locid}/${data[0].ts_id}`, {
      //   replace: true,
      // });
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
          onClick={() => {
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
                        adminKvalitetssikring(params.ts_id);
                        // navigate(`/admin/kvalitetssikring/${params.ts_id}`);
                      },
                      icon: <AutoGraphIcon />,
                    },
                  ]
                : []),
              {
                title: 'Opret station',
                icon: <AddLocationAltIcon fontSize="medium" />,
                onClick: () => {
                  createStamdata();
                  // navigate('/field/stamdata');
                },
              },
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
