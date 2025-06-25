import {Box, Typography} from '@mui/material';
import React from 'react';
import Button from './components/Button';
import {apiClient} from './apiClient';
import {queryClient} from './queryClient';
import {userQueryOptions} from './features/auth/useUser';
import {useNavigationFunctions} from './hooks/useNavigationFunctions';

type Props = {
  message: string;
};

const AccessDenied = (props: Props) => {
  const {home} = useNavigationFunctions();
  return (
    <Box display={'flex'} flexDirection={'column'} gap={2}>
      <Typography variant="h3" height={'50%'} alignSelf={'center'} textAlign={'center'}>
        {props.message}
      </Typography>
      <Box
        display={'flex'}
        flexDirection={'row'}
        gap={2}
        justifyContent={'center'}
        alignContent={'center'}
        alignItems={'center'}
      >
        <Typography variant="h5">Vil du gerne vende tilbage til forsiden?</Typography>
        <Button
          bttype="tertiary"
          onClick={() => {
            apiClient.get('/auth/logout/secure');
            queryClient.clear();
            queryClient.fetchQuery(userQueryOptions);
            home();
          }}
        >
          Tilbage
        </Button>
      </Box>
    </Box>
  );
};

export default AccessDenied;
