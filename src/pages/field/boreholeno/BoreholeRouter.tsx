import {Box, IconButton} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import NavBar from '~/components/NavBar';
import {useDisplayState} from '~/hooks/ui';
import Boreholeno from '~/pages/field/boreholeno/Boreholeno';
import MinimalSelectBorehole from '~/pages/field/boreholeno/MinimalSelectBorehole';
import ActionAreaBorehole from './ActionAreaBorehole';
import {Fullscreen, FullscreenExit} from '@mui/icons-material';
import {useAtom} from 'jotai';
import {fullScreenAtom} from '~/state/atoms';
import useBreakpoints from '~/hooks/useBreakpoints';

export default function BoreholeRouter() {
  const setIntakeNo = useDisplayState((state) => state.setIntakeNo);
  const {isMobile} = useBreakpoints();
  const [fullscreen, setFullscreen] = useAtom(fullScreenAtom);

  return (
    <>
      <CssBaseline />
      <NavBar>
        <Box display="block" flexGrow={1} overflow="hidden">
          <MinimalSelectBorehole />
        </Box>
        {!isMobile && (
          <IconButton
            onClick={() => {
              setFullscreen((prev) => !prev);
            }}
            color="inherit"
            size="large"
          >
            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        )}

        <NavBar.Close
          onClick={() => {
            setIntakeNo(null);
          }}
        />
      </NavBar>

      <Box
        component="main"
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          // height: `calc(100dvh - 64px - 56px - ${isMobile ? 0 : 8}px)`,
          overflow: 'hidden',
        }}
      >
        <Box
          display="flex"
          flexGrow={1}
          minWidth={0}
          gap={1}
          flexDirection={'column'}
          overflow="auto"
        >
          <Boreholeno />
        </Box>
        <ActionAreaBorehole />
      </Box>
    </>
  );
}
