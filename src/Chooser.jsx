import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import {Grid} from '@mui/material';
import React from 'react';
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
        marginTop: 10,
        display: 'flex',
      }}
    >
      <Grid item xs={12} sm={4} sx={{display: 'flex'}}>
        <ChoiseCard
          navigateTo="/field"
          title="Calypso @ Field"
          text="Indgang til at se tidsserier, lave kontrol målinger, skifte udstyr mm."
          icon={BuildCircleIcon}
        />
      </Grid>
      <Grid item xs={12} sm={4} sx={{display: 'flex'}}>
        <ChoiseCard
          navigateTo="/admin"
          title="Calypso @ Admin"
          text="Indgang til at omkonfigurere enheder, se notifikationer,
            kvalitetssikre tidsserier mm."
          icon={SettingsIcon}
        />
      </Grid>
    </Grid>
  );
};

export default Chooser;
