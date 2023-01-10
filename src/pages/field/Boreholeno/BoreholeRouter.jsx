import React, {useEffect, useState} from 'react';
import {useTheme} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import MinimalSelectBorehole from './MinimalSelectBorehole';
import {useParams, useNavigate} from 'react-router-dom';
import Boreholeno from './Boreholeno';
import {apiClient} from 'src/apiClient';
import {useQuery} from '@tanstack/react-query';

export default function BoreholeRouter() {
  const open = false;
  const [formToShow, setFormToShow] = useState(null);
  const [currIntake, setCurrIntake] = useState(null);
  const [boreholenoList, setBoreholenoList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [boreholeno, setSelectedBoreholeno] = useState(-1);

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
        intakeno = '';
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
          <MinimalSelectBorehole
            boreholeno={params.boreholeno}
            boreholenoList={data}
            selectedIntake={selectedItem}
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
        <div />
        <Boreholeno boreholeno={params.boreholeno} intakeno={params.intakeno} />
      </main>
    </div>
  );
}
