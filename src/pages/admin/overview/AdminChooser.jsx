import {Assignment} from '@mui/icons-material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import {Grid, Link, Typography} from '@mui/material';
import React from 'react';

import ChoiseCard from '~/components/ChoiseCard';
import NavBar from '~/components/NavBar';
import {useUser} from '~/features/auth/useUser';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const AdminChooser = () => {
  const user = useUser();
  const {field} = useNavigationFunctions();

  return (
    <>
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Title title="Admin" />
        <NavBar.Menu
          items={[
            {
              title: 'Field',
              icon: <BuildCircleIcon fontSize="medium" />,
              onClick: () => {
                field();
              },
            },
          ]}
        />
      </NavBar>
      {!user?.adminAccess && (
        <>
          <Typography variant="h4" sx={{textAlign: 'center', marginTop: 10}}>
            Denne side er under rivende udvikling og er ikke klar til produktion endnu. 👨‍💻
          </Typography>
          <Typography variant="h4" sx={{textAlign: 'center'}}>
            Her er en oversigt over de forskellige funktioner, som snart kommer...{' '}
            <Link
              onClick={() =>
                // navigate('/field')
                field()
              }
            >
              Gå tilbage til forsiden
            </Link>
          </Typography>
        </>
      )}
      <Grid
        container
        spacing={8}
        sx={{justifyContent: 'center', alignItems: 'center', marginTop: 10}}
      >
        <Grid
          item
          xs={10}
          sm={5}
          sx={{pointerEvents: adminAccess ? 'auto' : 'none', opacity: adminAccess ? 1 : 0.8}}
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
            navigateTo="opgaver"
            title="Opgaver"
            text="Administrer opgaver"
            icon={Assignment}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default AdminChooser;
