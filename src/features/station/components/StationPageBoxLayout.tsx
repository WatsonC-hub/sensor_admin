import {Box} from '@mui/material';
import React from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';

type StationPageBoxLayoutProps = {
  children: React.ReactNode;
};

const StationPageBoxLayout = ({children}: StationPageBoxLayoutProps) => {
  const {isMobile} = useBreakpoints();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        mx: 'auto',
        height: '100%',
        width: isMobile ? '100%' : undefined,
        maxWidth: isMobile ? '100%' : 1200,
        gap: 1,
      }}
      px={{
        xs: 2,
      }}
      pt={{
        mobile: 2,
        laptop: 4,
      }}
    >
      {children}
    </Box>
  );
};

export default StationPageBoxLayout;
