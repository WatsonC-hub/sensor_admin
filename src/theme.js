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
      grey: {
        100: '#F5F5F5',
        200: '#EEEEEE',
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
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
