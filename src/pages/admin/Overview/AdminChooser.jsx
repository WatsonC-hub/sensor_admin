import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {Grid, Link, Typography} from '@mui/material';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import NavBar from '~/components/NavBar';
import {authStore} from '~/state/store';
import ChoiseCard from '../../../components/ChoiseCard';

const AdminChooser = () => {
  const [iotAccess, adminAccess] = authStore((state) => [state.iotAccess, state.adminAccess]);
  const navigate = useNavigate();

  return (
    <>
      <NavBar />
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
        {/* {iotAccess && (
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
        )} */}
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
        {/* <Grid
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
        </Grid> */}
      </Grid>
    </>
  );
};

export default AdminChooser;
