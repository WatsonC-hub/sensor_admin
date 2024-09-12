import {Global} from '@emotion/react';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import {Typography, Box, Drawer, IconButton} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import React, {useEffect, useState} from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import {DrawerContext} from '~/state/contexts';

const drawerBleeding = 56;

interface DrawerComponentProps {
  header: string;
  openDrawerOnHeaderChange?: boolean;
  isMarkerSelected?: boolean;
  enableFull?: boolean;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const DrawerComponent = ({
  header,
  children,
  openDrawerOnHeaderChange,
  isMarkerSelected,
  enableFull,
  actions,
}: DrawerComponentProps) => {
  const [open, setOpen] = useState<'closed' | 'half' | 'full'>(
    isMarkerSelected ? 'half' : 'closed'
  );
  const {isTouch} = useBreakpoints();

  useEffect(() => {
    if (openDrawerOnHeaderChange) {
      setOpen('half');
    }
  }, [header]);

  return (
    <>
      <CssBaseline />
      <Global
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            maxHeight: `calc(${open == 'full' ? '100% - 64px' : '30%'} - ${drawerBleeding}px)`,
            minHeight: `${drawerBleeding}px`,
            overflow: 'visible',
            // transition that opens the drawer
            transition: 'height 0.2s ease-in-out',
            width: isTouch ? '100%' : '50%',
            margin: 'auto',
          },
        }}
      />
      <Drawer
        anchor="bottom"
        open={open !== 'closed'}
        onClose={() => setOpen('closed')}
        variant="persistent"
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -drawerBleeding,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            visibility: 'visible',
            right: 0,
            left: 0,
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: drawerBleeding,
            pl: 2,
            cursor: 'pointer',
          }}
          onClick={() => {
            if (enableFull) {
              setOpen((prev) => (prev === 'full' ? 'half' : 'full'));
            } else {
              setOpen((prev) => (prev === 'closed' ? 'half' : 'closed'));
            }
          }}
        >
          <Typography variant={isTouch ? 'body1' : 'h6'} sx={{p: 0}}>
            {header}
          </Typography>
          <Box p={1}>
            {open == 'full' || (open == 'half' && !enableFull) ? (
              <ExpandLessIcon />
            ) : (
              <ExpandMoreIcon />
            )}

            {/* {enableFull && (
              <IconButton
                onClick={() => setOpen((prev) => (prev === 'full' ? 'half' : 'full'))}
                color="primary"
              >
                {open == 'full' ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
              </IconButton>
            )} */}
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          overflow="auto"
          sx={{
            px: 2,
            pb: 2,
          }}
        >
          <DrawerContext.Provider value={open}>{children}</DrawerContext.Provider>
        </Box>
        {actions && (
          <Box display="flex" gap={1} ml="auto" mr={0}>
            {actions}
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default DrawerComponent;
