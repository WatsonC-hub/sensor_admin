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
        minWidth: 0,
        maxWidth: '100%',
        gap: 1,
      }}
      px={{
        xs: 2,
      }}
      pt={{
        mobile: 2,
        laptop: 4,
      }}
      pb={1}
    >
      {children}
    </Box>
  );
};

export default StationPageBoxLayout;
