import React, {useContext, useEffect, useState} from 'react';
import clsx from 'clsx';
import {useTheme} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Station from './Station';
import {getStations} from 'src/pages/field/fieldAPI';
import MinimalSelect from './MinimalSelect';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {ErrorBoundary} from 'react-error-boundary';
import ErrorPage from './ErrorPage';

export default function LocationRouter() {
  const [selectedItem, setSelectedItem] = useState('');

  const theme = useTheme();
  const params = useParams();
  let location = useLocation();
  const navigate = useNavigate();

  const {data} = useQuery(['stations', params.locid], () => getStations(params.locid), {
    enabled: params.locid !== undefined,
  });

  useEffect(() => {
    if (data) {
      let statId = params.statid;
      if (statId) {
        setSelectedItem(statId);
      } else {
        statId = '';
        if (data.length === 1) {
          statId = data[0].ts_id;
          navigate(`../location/${params.locid}/${statId}`, {
            replace: true,
          });
        }
        setSelectedItem(statId);
      }
    }
  }, [data]);

  return (
    <div>
      <CssBaseline />
      <AppBar position="sticky" style={{backgroundColor: theme.palette.primary}}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={(e) => {
              navigate(-1);
            }}
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <MinimalSelect
            locid={params.locid}
            stationList={data}
            selectedStation={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        </Toolbar>
      </AppBar>

      <main
        style={{
          flexGrow: 1,
          padding: theme.spacing(0.5),
        }}
      >
        <ErrorBoundary FallbackComponent={(props) => <ErrorPage {...props} />}>
          <Station stationId={params.statid ? params.statid : -1} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
