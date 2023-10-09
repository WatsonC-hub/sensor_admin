import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box, Typography, useTheme} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {useNavigate, useParams} from 'react-router-dom';
import {AppBarLayout} from 'src/NavBar';
import {apiClient} from 'src/apiClient';
import ErrorPage from './ErrorPage';
import MinimalSelect from './MinimalSelect';
import Station from './Station';

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
    <>
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
          // padding: theme.spacing(0.5),
        }}
      >
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          <Station
            stationId={params.statid ? params.statid : -1}
            stamdata={data?.filter((elem) => elem.ts_id == params.statid)?.[0]}
          />
        </ErrorBoundary>
      </main>
    </>
  );
}
