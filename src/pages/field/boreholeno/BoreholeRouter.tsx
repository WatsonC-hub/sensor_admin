import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {apiClient} from '~/apiClient';
import {HomeButton, NavBarMenu} from '~/components/NavBar';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import Boreholeno from '~/pages/field/boreholeno/Boreholeno';
import MinimalSelectBorehole from '~/pages/field/boreholeno/MinimalSelectBorehole';

export default function BoreholeRouter() {
  const [selectedItem, setSelectedItem] = useState(-1);

  const params = useParams();
  const navigate = useNavigate();
  const {boreholeIntake} = useNavigationFunctions();

  const {data: data} = useQuery({
    queryKey: ['borehole', params.boreholeno],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole/jupiter/${params.boreholeno}`);
      return data;
    },
    enabled: params.boreholeno !== undefined,
    placeholderData: [],
  });

  useEffect(() => {
    if (data && params.boreholeno) {
      let intakeno = params.intakeno ?? '';
      if (intakeno) {
        setSelectedItem(parseInt(intakeno));
      } else {
        if (data.length === 1) {
          intakeno = data[0].intakeno;
          setSelectedItem(parseInt(intakeno));
          boreholeIntake(params.boreholeno, intakeno, {replace: true});
        }
        setSelectedItem(parseInt(intakeno));
      }
    }
  }, [data]);

  return (
    <>
      <CssBaseline />
      <AppBar position="sticky" style={{backgroundColor: 'primary'}}>
        <Toolbar>
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
            <MinimalSelectBorehole
              boreholeno={params.boreholeno ? params.boreholeno : ''}
              boreholenoList={data}
              selectedIntake={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          </Box>
          <Box display="flex" justifyContent="end" alignItems="center" flexShrink={0}>
            <HomeButton />
            <NavBarMenu highligtFirst={false} />
          </Box>
        </Toolbar>
      </AppBar>

      <main
        style={{
          flexGrow: 1,
        }}
      >
        <Boreholeno
          boreholeno={params.boreholeno ? params.boreholeno : '-1'}
          intakeno={params.intakeno ? parseInt(params.intakeno) : -1}
        />
      </main>
    </>
  );
}
