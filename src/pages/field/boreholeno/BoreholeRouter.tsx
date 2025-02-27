import {Box} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import NavBar from '~/components/NavBar';
import {useDisplayBoreholePage} from '~/hooks/ui';
import Boreholeno from '~/pages/field/boreholeno/Boreholeno';
import MinimalSelectBorehole from '~/pages/field/boreholeno/MinimalSelectBorehole';

export default function BoreholeRouter() {
  const {setIntakeNo} = useDisplayBoreholePage();
  return (
    <>
      <CssBaseline />
      <NavBar>
        <Box display="block" flexGrow={1} overflow="hidden">
          <MinimalSelectBorehole />
        </Box>
        <NavBar.Home />
        <NavBar.Menu highligtFirst={false} />
        <NavBar.Close onClick={() => setIntakeNo(null)} />
      </NavBar>

      <main
        style={{
          flexGrow: 1,
        }}
      >
        <Boreholeno />
      </main>
    </>
  );
}
