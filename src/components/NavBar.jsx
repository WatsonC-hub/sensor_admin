import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import moment from 'moment';
import React, {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {useNotificationOverview} from '~/hooks/query/useNotificationOverview';
import useBreakpoints from '~/hooks/useBreakpoints';
import {MetadataContext} from '~/state/contexts';
import LogoSvg from '~/calypso.svg?react';
import NotificationList from '~/components/NotificationList';
import SmallLogo from '~/logo.svg?react';
import {captureDialogAtom} from '~/state/atoms';
import {authStore} from '~/state/store';
import {apiClient} from '~/apiClient';

const LogOut = ({element: Element}) => {
  const [resetState] = authStore((state) => [state.resetState]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    resetState();
    navigate('/');
    apiClient.get('/auth/logout/secure');
    queryClient.clear();
  };

  return <Box onClick={handleLogout}>{Element}</Box>;
};

export const AppBarLayout = ({children, style}) => {
  return (
    <AppBar position="sticky" enableColorOnDark>
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
          pl: 0.5,
          pr: 0.5,
        }}
      >
        {children}
      </Toolbar>
    </AppBar>
  );
};

const NavBarNotifications = () => {
  const navigate = useNavigate();

  const {data} = useNotificationOverview();

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
      sx={{cursor: 'pointer', mr: 2, '& .MuiBadge-badge': {fontSize: 10}}}
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

export const NavBarMenu = ({highligtFirst, items}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {highligtFirst && items.length > 0 && (
        <Button
          color="grey"
          variant="contained"
          onClick={items?.[0].onClick}
          startIcon={items?.[0].icon}
        >
          {items?.[0].title}
        </Button>
      )}
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
        {items
          ?.filter((item, index) => (highligtFirst ? !(index == 0) : true))
          ?.map((item) => (
            <MenuItem
              key={item.title}
              onClick={() => {
                handleClose();
                item.onClick();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {item.title}
            </MenuItem>
          ))}

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

const Logo = () => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  return matches ? <SmallLogo /> : <LogoSvg />;
};

const GoBack = () => {
  const navigate = useNavigate();

  return (
    <IconButton
      color="inherit"
      onClick={(e) => {
        navigate(-1);
      }}
      size="large"
    >
      <KeyboardBackspaceIcon />
    </IconButton>
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
  const {isMobile} = useBreakpoints();
  const metadata = useContext(MetadataContext);

  let content;

  const url = window.location.pathname.replace(/\/$/, '');

  if (!authenticated) {
    return (
      <AppBarLayout>
        <Logo />
        {/* <Typography variant="h4">Field</Typography> */}
        {url !== '/register' ? (
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

  if (url.includes('/location') || url.includes('/borehole')) {
    return null;
  }

  if (url == '') {
    content = <Logo />;
  }

  if (url == '/field') {
    content = (
      <>
        {iotAccess ? (
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
        )}
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={() => setOpen(true)} size="large">
              <PhotoCameraRounded />
            </IconButton>
          </>
        ) : (
          <Typography variant="h4">Field</Typography>
        )}
        <Box>
          {adminAccess && <NavBarNotifications />}
          <NavBarMenu
            highligtFirst={!isMobile}
            items={[
              {
                title: 'Admin',
                icon: <SettingsIcon fontSize="medium" />,
                onClick: () => {
                  navigate('/admin');
                },
              },
            ]}
          />
        </Box>
      </>
    );
  }

  if (url == '/field/stamdata') {
    content = (
      <>
        <GoBack />
        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={() => setOpen(true)} size="large">
              <PhotoCameraRounded />
            </IconButton>
            <Box>
              {adminAccess && <NavBarNotifications />}
              <NavBarMenu />
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h4">Field</Typography>
            <Box>
              {adminAccess && <NavBarNotifications />}
              <NavBarMenu
                highligtFirst={!isMobile}
                items={[
                  {
                    title: 'Admin',
                    icon: <SettingsIcon fontSize="medium" />,
                    onClick: () => {
                      navigate('/admin');
                    },
                  },
                ]}
              />
            </Box>
          </>
        )}
      </>
    );
  }

  if (url.includes('/admin')) {
    content = (
      <>
        <GoBack />
        <Typography variant="h4">Admin</Typography>

        <Box>
          {adminAccess && <NavBarNotifications />}
          <NavBarMenu
            highligtFirst={!isMobile}
            items={[
              {
                title: 'Field',
                icon: <BuildCircleIcon fontSize="medium" />,
                onClick: () => {
                  navigate('/field');
                },
              },
            ]}
          />
        </Box>
      </>
    );
  }

  if (url.includes('/admin/kvalitetssikring/')) {
    content = (
      <>
        <GoBack />
        <Typography variant={isMobile ? 'h6' : 'h4'}>Kvalitetssikring</Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <NotificationList />
          <NavBarMenu
            highligtFirst={!isMobile}
            items={[
              {
                title: 'Til service',
                icon: <QueryStatsIcon />,
                onClick: () => {
                  navigate(`/field/location/${metadata?.loc_id}/${metadata?.ts_id}`);
                },
              },
              {
                title: 'Field',
                icon: <BuildCircleIcon fontSize="medium" />,
                onClick: () => {
                  navigate('/field');
                },
              },
            ]}
          />
        </Box>
      </>
    );
  }

  return <AppBarLayout>{content}</AppBarLayout>;
};

export default NavBar;
