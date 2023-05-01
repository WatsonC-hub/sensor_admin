import React from 'react';
import {useTheme, Box, Typography} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Station from './Station';
import MinimalSelect from './MinimalSelect';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';
import ErrorPage from './ErrorPage';
import {apiClient} from 'src/apiClient';
import {AppBarLayout} from 'src/NavBar';

export default function LocationRouter() {
  const theme = useTheme();
  const params = useParams();
  const navigate = useNavigate();

  const {data} = useQuery(
    ['stations', params.locid],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${params.locid}`);
      return data;
    },
    {
      enabled: params.locid !== undefined,
      onSuccess: (data) => {
        if (data.length === 1 && params.statid === undefined) {
          navigate(`../location/${params.locid}/${data[0].ts_id}`, {
            replace: true,
          });
        }
      },
    }
  );

  return (
    <div>
      <CssBaseline />
      <AppBarLayout style={{}}>
        <IconButton
          color="inherit"
          onClick={(e) => {
            navigate(-1);
          }}
          size="large"
        >
          <KeyboardBackspaceIcon />
        </IconButton>
        <Box>
          <Typography pl={1.7}>{data?.[0].loc_name}</Typography>
          <MinimalSelect locid={params.locid} stationList={data} />
        </Box>
      </AppBarLayout>

      <main
        style={{
          flexGrow: 1,
          padding: theme.spacing(0.5),
        }}
      >
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          <Station
            stationId={params.statid ? params.statid : -1}
            stamdata={data?.filter((elem) => elem.ts_id == params.statid)?.[0]}
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}
