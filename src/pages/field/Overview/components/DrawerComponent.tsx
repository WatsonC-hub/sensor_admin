import React, {useEffect, useState} from 'react';
import {Typography, Box, Drawer, IconButton} from '@mui/material';
import {Global} from '@emotion/react';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import CssBaseline from '@mui/material/CssBaseline';

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
            height: `calc(${open == 'full' ? '100%' : '30%'} - ${drawerBleeding}px)`,
            overflow: 'visible',
            transition: 'height 0.3s',
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
          }}
        >
          <Typography variant="body1" sx={{p: 2}}>
            {header}
          </Typography>
          <Box>
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
            height: '100%',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Drawer>
    </>
  );
};

export default DrawerComponent;
