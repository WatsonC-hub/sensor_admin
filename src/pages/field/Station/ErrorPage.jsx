// Component to show when there is an error in the station page

import React from 'react';
import {Typography, Box, Link} from '@mui/material';
import {useNavigate} from 'react-router-dom';

const ErrorPage = ({error}) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Typography variant="h4" gutterBottom>
        Der er desværre sket en fejl
      </Typography>
      <Typography variant="body1" gutterBottom>
        Der er sket en fejl på siden.{' '}
        <Link component="button" variant="body2" onClick={() => navigate('/field')}>
          Gå til forside
        </Link>
      </Typography>

      <Typography variant="body2" gutterBottom>
        Fejlbesked:
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        sx={{
          color: 'red',
          backgroundColor: 'lightgrey',
          padding: '1rem',
          borderRadius: '1rem',
        }}
      >
        {error.message}
      </Typography>
    </Box>
  );
};

export default ErrorPage;
