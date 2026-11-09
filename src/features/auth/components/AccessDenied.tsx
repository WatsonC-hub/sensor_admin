import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import {Box, Paper, Typography} from '@mui/material';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import NavBar from '~/components/NavBar';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const AccessDenied = () => {
  const queryClient = useQueryClient();
  const {home} = useNavigationFunctions();

  const handleLogout = async () => {
    await apiClient.get('/auth/logout/secure');
    queryClient.setQueryData(queryKeys.user(), null);
    queryClient.clear();
    home(true);
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100dvh'}}>
      <NavBar>
        <NavBar.Logo />
      </NavBar>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
          bgcolor: 'grey.100',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 480,
            width: '100%',
            p: {xs: 3, sm: 5},
            borderRadius: 3,
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockOutlinedIcon sx={{fontSize: 36}} />
          </Box>
          <Typography variant="h5" component="h1" sx={{fontWeight: 600}}>
            Ingen adgang
          </Typography>
          <Typography>
            Din bruger har hverken adgang til IoT-stationer eller pejleboringer.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Kontakt WatsonC, hvis du ønsker opsætning af IoT-stationer eller pejleboringer, eller
            hvis du mener, at det er en fejl.
          </Typography>
          <Button
            bttype="primary"
            startIcon={<LogoutIcon />}
            onClick={() => void handleLogout()}
            sx={{mt: 1}}
          >
            Log ud
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default AccessDenied;
