import React from 'react';
import {Card, CardContent, CardHeader, Grid, Typography} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import {useNavigate} from 'react-router-dom';
import ChoiseCard from './components/ChoiseCard';
const Chooser = () => {
  let navigate = useNavigate();

  return (
    <Grid
      container
      spacing={8}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
      }}
    >
      <Grid item xs={12} sm={4}>
        <ChoiseCard
          navigateTo="/field"
          title="Sensor @ Field"
          text="Indgang til at se tidsserier, lave kontrol målinger, skifte udstyr mm."
          icon={BuildCircleIcon}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <ChoiseCard
          navigateTo="/admin"
          title="Sensor @ Admin"
          text="Indgang til at omkonfigurere enheder, se notifikationer,
            kvalitetssikre tidsserier mm."
          icon={SettingsIcon}
        />
      </Grid>
    </Grid>
  );
};

export default Chooser;
