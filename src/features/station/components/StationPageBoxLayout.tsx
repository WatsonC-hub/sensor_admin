import {Box} from '@mui/material';
import React from 'react';

type StationPageBoxLayoutProps = {
  children: React.ReactNode;
};

const StationPageBoxLayout = ({children}: StationPageBoxLayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        mx: 'auto',
        height: '100%',
        gap: 2,
      }}
      px={{
        xs: 2,
      }}
      pt={{
        mobile: 2,
        laptop: 6,
      }}
    >
      {children}
    </Box>
  );
};

export default StationPageBoxLayout;
