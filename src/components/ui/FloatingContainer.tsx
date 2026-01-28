import {Box, BoxProps, useTheme} from '@mui/material';
import {merge} from 'lodash';
import React from 'react';

const FloatingContainer = ({children, sx, ...otherProps}: BoxProps) => {
  const theme = useTheme();

  const defaultSx: BoxProps['sx'] = {
    position: 'sticky',
    pb: 1,
    bottom: 0,
    right: 20,
    ml: 'auto',
    zIndex: theme.zIndex.fab,
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
  };

  const boxSx = merge(defaultSx, sx);

  return (
    <Box sx={boxSx} {...otherProps}>
      {children}
    </Box>
  );
};

export default FloatingContainer;
