import React, {useEffect, useState, createContext} from 'react';
import {Typography, Box, Drawer, IconButton} from '@mui/material';
import {Global} from '@emotion/react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import {DrawerContext} from '~/state/contexts';
import CssBaseline from '@mui/material/CssBaseline';
import useBreakpoints from '~/hooks/useBreakpoints';

const drawerBleeding = 56;

interface DrawerComponentProps {
  header: string;
  openDrawerOnHeaderChange?: boolean;
  triggerOpenDrawer?: boolean;
  triggerCloseDrawer?: boolean;
  enableFull?: boolean;
  children?: React.ReactNode;
}

const DrawerComponent = ({
  header,
  children,
  openDrawerOnHeaderChange,
  triggerOpenDrawer,
  triggerCloseDrawer,
  enableFull,
}: DrawerComponentProps) => {
  const [open, setOpen] = useState<'closed' | 'half' | 'full'>('closed');
  const {isTouch} = useBreakpoints();

  useEffect(() => {
    if (openDrawerOnHeaderChange) {
      setOpen('half');
    }
  }, [header]);

  useEffect(() => {
    if (triggerOpenDrawer) {
      setOpen('half');
    }
  }, [triggerOpenDrawer]);
  useEffect(() => {
    if (triggerCloseDrawer) {
      setOpen('closed');
    }
  }, [triggerCloseDrawer]);

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
          }}
        >
          <Typography variant="body1" sx={{p: 0}}>
            {header}
          </Typography>
          <Box display="flex">
            <IconButton
              onClick={() => setOpen((prev) => (prev === 'closed' ? 'half' : 'closed'))}
              color="primary"
            >
              {open != 'closed' ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
            {enableFull && (
              <IconButton
                onClick={() => setOpen((prev) => (prev === 'full' ? 'half' : 'full'))}
                color="primary"
              >
                {open == 'full' ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
              </IconButton>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            px: 2,
            pb: 2,
          }}
        >
          <DrawerContext.Provider value={open}>{children}</DrawerContext.Provider>
        </Box>
      </Drawer>
    </>
  );
};

export default DrawerComponent;
