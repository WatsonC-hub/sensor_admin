import {createTheme} from '@mui/material';
import {daDK} from '@mui/material/locale';

const theme = createTheme(
  {
    palette: {
      // type: "light",
      primary: {
        main: 'rgb(0,120,109)',
      },
      secondary: {
        main: '#FFA137',
      },
    },
    typography: {
      fontFamily: 'Open Sans',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
        mobile: 0,
        tablet: 640,
        laptop: 1024,
        desktop: 1200,
      },
    },
  },
  daDK
);

export default theme;
