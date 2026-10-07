import {Box, Typography} from '@mui/material';
import React from 'react';

import {apiClient} from './apiClient';
import Button from './components/Button';
import {queryKeys} from './helpers/queryKeyFactoryHelper';
import {useNavigationFunctions} from './hooks/useNavigationFunctions';
import {queryClient} from './queryClient';

type Props = {
  message: string;
};

const AccessDenied = (props: Props) => {
  const {home} = useNavigationFunctions();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          height: '50%',
          alignSelf: 'center',
          textAlign: 'center',
        }}
      >
        {props.message}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'center',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">Vil du gerne vende tilbage til forsiden?</Typography>
        <Button
          bttype="tertiary"
          onClick={() => {
            apiClient.get('/auth/logout/secure');
            queryClient.setQueryData(queryKeys.user(), null);
            queryClient.clear();
            home(true);
          }}
        >
          Tilbage
        </Button>
      </Box>
    </Box>
  );
};

export default AccessDenied;
