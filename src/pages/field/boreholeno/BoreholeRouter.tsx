import {Box} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import NavBar from '~/components/NavBar';
import {useDisplayState} from '~/hooks/ui';
import Boreholeno from '~/pages/field/boreholeno/Boreholeno';
import MinimalSelectBorehole from '~/pages/field/boreholeno/MinimalSelectBorehole';
import ActionAreaBorehole from './ActionAreaBorehole';

export default function BoreholeRouter() {
  const setIntakeNo = useDisplayState((state) => state.setIntakeNo);

  return (
    <>
      <CssBaseline />
      <NavBar>
        <Box display="block" flexGrow={1} overflow="hidden">
          <MinimalSelectBorehole />
        </Box>
        <NavBar.Home />
        <NavBar.Menu highligtFirst={false} />

        <NavBar.Close
          onClick={() => {
            setIntakeNo(null);
          }}
        />
      </NavBar>

      <main style={{flexGrow: 1, overflow: 'auto'}}>
        <Box
          display="flex"
          flexDirection={'column'}
          gap={1}
          position={'relative'}
          // height={'100%'}
          //
        >
          <Boreholeno />
        </Box>
      </main>
      <ActionAreaBorehole />
    </>
  );
}
