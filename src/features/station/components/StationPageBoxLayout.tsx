import {Box} from '@mui/material';
import React from 'react';

import type {SxProps, Theme} from '@mui/material';

import useBreakpoints from '~/hooks/useBreakpoints';

type StationPageBoxLayoutProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

const StationPageBoxLayout = ({children, sx}: StationPageBoxLayoutProps) => {
  const {isTouch} = useBreakpoints();
  return (
    <Box
      key={'station-page-box-layout'}
      id="station-page-box-layout"
      sx={[
        {
          px: {
            xs: 2,
          },

          pt: {
            mobile: 2,
            laptop: 4,
          },

          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          mx: 'auto',
          minWidth: 0,
          maxWidth: '100%',
          gap: 1,
          flexGrow: isTouch ? 1 : 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
};

export default StationPageBoxLayout;
