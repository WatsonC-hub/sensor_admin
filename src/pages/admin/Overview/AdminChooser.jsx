import React from 'react';
import {Card, CardContent, CardHeader, Grid, Typography, Link} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import RouterIcon from '@mui/icons-material/Router';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ChoiseCard from '../../../components/ChoiseCard';
import {authStore} from 'src/state/store';
import {useNavigate} from 'react-router-dom';

const AdminChooser = () => {
  const [iotAccess, adminAccess] = authStore((state) => [state.iotAccess, state.adminAccess]);
  const navigate = useNavigate();

  return (
    <>
      {!adminAccess && (
        <>
          <Typography variant="h4" sx={{textAlign: 'center', marginTop: 10}}>
            Denne side er under rivende udvikling og er ikke klar til produktion endnu. 👨‍💻
          </Typography>
          <Typography variant="h4" sx={{textAlign: 'center'}}>
            Her er en oversigt over de forskellige funktioner, som snart kommer...{' '}
            <Link onClick={() => navigate('/field')}>Gå tilbage til forsiden</Link>
          </Typography>
        </>
      )}
      <Grid
        container
        spacing={8}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        {iotAccess && (
          <Grid
            item
            xs={10}
            sm={5}
            sx={{
              pointerEvents: adminAccess ? 'auto' : 'none',
              opacity: adminAccess ? 1 : 0.8,
            }}
          >
            <ChoiseCard
              navigateTo="konfiguration"
              title="Omkonfigurer enheder"
              text="Omkonfigurer enheder"
              icon={RouterIcon}
            />
          </Grid>
        )}
        <Grid
          item
          xs={10}
          sm={5}
          sx={{
            pointerEvents: adminAccess ? 'auto' : 'none',
            opacity: adminAccess ? 1 : 0.8,
          }}
        >
          <ChoiseCard
            navigateTo="kvalitetssikring"
            title="Kvalitetssikring"
            text="Kvalitetssikre tidsserier"
            icon={AutoGraphIcon}
          />
        </Grid>
        <Grid
          item
          xs={10}
          sm={5}
          sx={{
            pointerEvents: adminAccess ? 'auto' : 'none',
            opacity: adminAccess ? 1 : 0.8,
          }}
        >
          <ChoiseCard
            navigateTo="notifikationer"
            title="Notifikationer"
            text="Se notifikationer"
            icon={NotificationsActiveIcon}
          />
        </Grid>
        <Grid
          item
          xs={10}
          sm={5}
          sx={{
            pointerEvents: adminAccess ? 'auto' : 'none',
            opacity: adminAccess ? 1 : 0.8,
          }}
        >
          <ChoiseCard
            navigateTo="brugerstyring"
            title="Brugerstyring"
            text="Administrer brugere"
            icon={SupervisorAccountIcon}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default AdminChooser;
