import React from 'react';
import {useNavigate} from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Badge,
  Typography,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {ReactComponent as LogoSvg} from './calypso.svg';
import {ReactComponent as SmallLogo} from './logo.svg';
import {authStore} from './state/store';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import {useAtom} from 'jotai';
import {captureDialogAtom} from './state/atoms';
import useWhatPage from './hooks/useWhatPage';
import {useQueryClient, useQuery} from '@tanstack/react-query';
import {apiClient} from './apiClient';
import moment from 'moment';

const LogOut = ({element: Element}) => {
  const [resetState] = authStore((state) => [state.resetState]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    resetState();
    navigate('/');
    queryClient.clear();
  };

  return <Box onClick={handleLogout}>{Element}</Box>;
};

export const AppBarLayout = ({children, style}) => {
  return (
    <AppBar position="sticky">
      <Toolbar
        style={
          style
            ? style
            : {
                flexGrow: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }
        }
        sx={{
          height: 64,
        }}
      >
        {children}
      </Toolbar>
    </AppBar>
  );
};

const NavBarNotifications = () => {
  const navigate = useNavigate();

  const {data, isLoading, error} = useQuery(['overblik'], async ({signal}) => {
    const {data} = await apiClient.get(`/sensor_admin/overblik`, {
      signal,
    });
    return data;
  });

  return (
    <Badge
      badgeContent={
        data?.filter(
          (item) =>
            item.flag === 3 &&
            item.is_customer_service === false &&
            moment(item.dato).diff(moment(), 'hours') > -24
        ).length
      }
      color="error"
      onClick={() => {
        if (!window.location.pathname.includes('/notifikationer')) {
          navigate('/admin/notifikationer');
        }
      }}
      sx={{cursor: 'pointer', '& .MuiBadge-badge': {fontSize: 10}}}
    >
      <Badge
        badgeContent={
          data?.filter((item) => item.flag === 3 && item.is_customer_service === false).length
        }
        color="error"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        sx={{'& .MuiBadge-badge': {fontSize: 10}}}
      >
        <NotificationsIcon />
      </Badge>
    </Badge>
  );
};

const NavBarMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  let navigate = useNavigate();
  const page = useWhatPage();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <SettingsIcon />
      </IconButton>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {page == 'admin' ? (
          <MenuItem
            onClick={() => {
              handleClose();
              navigate('/field');
            }}
          >
            <ListItemIcon>
              <BuildCircleIcon fontSize="medium" />
            </ListItemIcon>
            {'Field'}
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => {
              handleClose();
              navigate('/admin');
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="medium" />
            </ListItemIcon>
            {'Admin'}
          </MenuItem>
        )}

        <MenuItem onClick={handleClose}>
          <LogOut
            element={
              <>
                <ListItemIcon>
                  <LogoutIcon fontSize="medium" />
                </ListItemIcon>
                {'Logout'}
              </>
            }
          />
        </MenuItem>
      </Menu>
    </>
  );
};

const NavBar = ({children}) => {
  const [authenticated, iotAccess, adminAccess] = authStore((state) => [
    state.authenticated,
    state.iotAccess,
    state.adminAccess,
  ]);
  const [open, setOpen] = useAtom(captureDialogAtom);
  const navigate = useNavigate();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const LogOutButton = (
    <Button color="grey" variant="contained" startIcon={<LogoutIcon />}>
      Log ud
    </Button>
  );
  if (!authenticated) {
    return (
      <AppBarLayout>
        {matches ? <SmallLogo /> : <LogoSvg />}
        {/* <Typography variant="h4">Field</Typography> */}
        {location.pathname !== '/register' ? (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              navigate('/register');
            }}
          >
            Opret konto
          </Button>
        ) : (
          <Button color="secondary" variant="contained" onClick={(e) => navigate('/')}>
            Log ind
          </Button>
        )}
      </AppBarLayout>
    );
  }
  if (location.pathname.includes('/location') || location.pathname.includes('/borehole')) {
    return null;
  }

  if (location.pathname.includes('/field')) {
    return (
      <AppBarLayout>
        {!location.pathname.includes('/stamdata') ? (
          iotAccess ? (
            <Button
              color="secondary"
              variant="contained"
              onClick={() => {
                navigate('stamdata');
                //setAddStationDisabled(true);
              }}
              size="small"
            >
              Opret station
            </Button>
          ) : (
            <LogoSvg />
          )
        ) : (
          <IconButton
            color="inherit"
            onClick={
              (e) => navigate('') //context.setLocationId(-1)
            }
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
        )}

        {!matches && <Typography variant="h4">Field</Typography>}

        {matches && (
          <IconButton color="inherit" onClick={() => setOpen(true)} size="large">
            <PhotoCameraRounded />
          </IconButton>
        )}

        {
          //COMMENT THIS FOR TEMP PRODUCTION
          matches ? (
            <>
              <Box>
                <NavBarNotifications />
                <NavBarMenu />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: 300,
              }}
            >
              <Box sx={{p: 2}}>
                <NavBarNotifications />
              </Box>
              <Button
                color="grey"
                variant="contained"
                onClick={() => {
                  navigate('/admin');
                }}
                startIcon={<SettingsIcon />}
              >
                Admin
              </Button>
              <LogOut element={LogOutButton} />
            </Box>
          )
        }
      </AppBarLayout>
    );
  }

  if (location.pathname.includes('/admin/')) {
    return (
      <AppBarLayout>
        <IconButton
          color="inherit"
          onClick={(e) => {
            navigate(-1);
          }}
          size="large"
        >
          <KeyboardBackspaceIcon />
        </IconButton>
        <Typography variant="h4">Admin</Typography>

        {matches ? (
          <>
            <Box>
              <NavBarNotifications />
              <NavBarMenu />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: 300,
            }}
          >
            <Box sx={{p: 2}}>
              <NavBarNotifications />
            </Box>
            <Button
              color="grey"
              variant="contained"
              onClick={() => {
                navigate('/field');
              }}
              startIcon={<BuildCircleIcon />}
            >
              Field
            </Button>
            <LogOut element={LogOutButton} />
          </Box>
        )}
      </AppBarLayout>
    );
  }

  if (location.pathname.includes('/admin')) {
    return (
      <AppBarLayout>
        {matches ? <SmallLogo /> : <LogoSvg />}

        <Typography variant="h4">Admin</Typography>

        {matches ? (
          <>
            <Box>
              <NavBarNotifications />
              <NavBarMenu />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              maxWidth: 300,
            }}
          >
            <Box sx={{p: 2}}>
              <NavBarNotifications />
            </Box>
            <Button
              color="grey"
              variant="contained"
              onClick={() => {
                navigate('/field');
              }}
              startIcon={<BuildCircleIcon />}
            >
              Field
            </Button>
            <LogOut element={LogOutButton} />
          </Box>
        )}
      </AppBarLayout>
    );
  }

  return (
    <AppBarLayout>
      {matches ? <SmallLogo /> : <LogoSvg />}

      <Typography variant="h4"></Typography>

      <LogOut />
    </AppBarLayout>
  );
};

export default NavBar;
