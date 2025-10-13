import {Box} from '@mui/material';
import React from 'react';
import useBreakpoints from '~/hooks/useBreakpoints';

type StationPageBoxLayoutProps = {
  children: React.ReactNode;
};

const StationPageBoxLayout = ({children}: StationPageBoxLayoutProps) => {
  const {isTouch} = useBreakpoints();
  return (
    <Box
      key={'station-page-box-layout'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        mx: 'auto',
        minWidth: 0,
        maxWidth: '100%',
        gap: 1,
        flexGrow: isTouch ? 1 : 0,
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
