import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {Box, Typography, useTheme} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {apiClient} from 'src/apiClient';
import Boreholeno from './Boreholeno';
import MinimalSelectBorehole from './MinimalSelectBorehole';

export default function BoreholeRouter() {
  const [selectedItem, setSelectedItem] = useState(-1);

  const theme = useTheme();
  const params = useParams();
  const navigate = useNavigate();

  const {data: data} = useQuery(
    ['borehole', params.boreholeno],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole/jupiter/${params.boreholeno}`);
      return data;
    },
    {
      enabled: params.boreholeno !== undefined,
      placeholderData: [],
    }
  );

  useEffect(() => {
    if (data) {
      let intakeno = params.intakeno;
      if (intakeno) {
        setSelectedItem(parseInt(intakeno));
      } else {
        intakeno = -1;
        console.log(data);
        if (data.length === 1) {
          intakeno = data[0].intakeno;
          navigate(`../borehole/${params.boreholeno}/${intakeno}`, {
            replace: true,
          });
        }
        setSelectedItem(intakeno);
      }
    }
  }, [data]);

  console.log(selectedItem);

  return (
    <>
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
          <Box>
            <Typography pl={1.7}>{params.boreholeno}</Typography>
            <MinimalSelectBorehole
              boreholeno={params.boreholeno}
              boreholenoList={data}
              selectedIntake={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <main
        style={{
          flexGrow: 1,
          // padding: theme.spacing(0.5),
        }}
      >
        <Boreholeno boreholeno={params.boreholeno} intakeno={params.intakeno} />
      </main>
    </>
  );
}
