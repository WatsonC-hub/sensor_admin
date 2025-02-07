import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {apiClient} from '~/apiClient';
import {HomeButton, NavBarMenu} from '~/components/NavBar';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import Boreholeno from '~/pages/field/boreholeno/Boreholeno';
import MinimalSelectBorehole from '~/pages/field/boreholeno/MinimalSelectBorehole';

interface boreholeRouterProps {
  boreholeno: string;
  intakeno?: number | undefined;
}

export default function BoreholeRouter({boreholeno, intakeno}: boreholeRouterProps) {
  const [selectedItem, setSelectedItem] = useState(-1);

  const navigate = useNavigate();
  const {boreholeIntake} = useNavigationFunctions();

  const {data: data} = useQuery({
    queryKey: ['borehole', boreholeno],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole/jupiter/${boreholeno}`);
      return data;
    },
    enabled: boreholeno !== undefined,
    placeholderData: [],
  });

  useEffect(() => {
    if (data && boreholeno) {
      if (intakeno) {
        setSelectedItem(intakeno);
      } else {
        if (data.length === 1) {
          intakeno = data[0].intakeno;
          setSelectedItem(intakeno ? intakeno : -1);
          boreholeIntake(boreholeno, intakeno ? intakeno : -1, {replace: true});
        }
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
              boreholeno={boreholeno}
              intakeno={intakeno}
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
          boreholeno={boreholeno ? boreholeno : '-1'}
          intakeno={intakeno ? intakeno : -1}
        />
      </main>
    </>
  );
}
