import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
import {useState, ReactNode, useContext, MouseEventHandler} from 'react';
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
import {MapRounded} from '@mui/icons-material';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const LogOut = ({children}: {children?: ReactNode}) => {
  const [resetState] = authStore((state) => [state.resetState]);
  const queryClient = useQueryClient();
  const {home} = useNavigationFunctions();

  const handleLogout = () => {
    resetState();
    // navigate('/');
    home();
    apiClient.get('/auth/logout/secure');
    queryClient.clear();
  };

  return (
    <Box
      onClick={handleLogout}
      sx={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </Box>
  );
};

export const HomeButton = () => {
  const {field} = useNavigationFunctions();

  return (
    <IconButton
      color="inherit"
      onClick={(e) => {
        // navigate('/field');
        field();
      }}
      size="large"
    >
      <MapRounded />
    </IconButton>
  );
};

export const AppBarLayout = ({children}: {children?: ReactNode}) => {
  return (
    <AppBar position="sticky" enableColorOnDark>
      <Toolbar
        sx={{
          height: 64,
          pl: 1,
          pr: 1,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {children}
      </Toolbar>
    </AppBar>
  );
};

const NavBarNotifications = () => {
  const {adminNotifikationer} = useNavigationFunctions();

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
          // navigate('/admin/notifikationer');
          adminNotifikationer();
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

export const NavBarMenu = ({
  highligtFirst,
  items,
}: {
  highligtFirst?: boolean;
  items?: {
    title: string;
    icon: ReactNode;
    onClick: () => void;
  }[];
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (event.currentTarget instanceof HTMLElement) setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {highligtFirst && items != undefined && items.length > 0 && (
        <Button
          // color="grey"
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
        <MoreVertIcon />
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
          <LogOut>
            <ListItemIcon>
              <LogoutIcon fontSize="medium" />
            </ListItemIcon>
            {'Logout'}
          </LogOut>
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

const NavBar = ({children}: {children?: ReactNode}) => {
  const [authenticated, iotAccess, adminAccess] = authStore((state) => [
    state.authenticated,
    state.iotAccess,
    state.adminAccess,
  ]);
  const [openQRScanner, setOpenQRScanner] = useAtom(captureDialogAtom);
  const {register, home, admin, createStamdata, field, station} = useNavigationFunctions();
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
              // navigate('/register');
              register();
            }}
          >
            Opret konto
          </Button>
        ) : (
          <Button color="secondary" variant="contained" onClick={(e) => home()}>
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
        <Logo />
        {isMobile ? (
          <IconButton
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            color="inherit"
            onClick={() => setOpenQRScanner(true)}
            size="large"
          >
            <QrCodeScannerIcon />
          </IconButton>
        ) : (
          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
            variant="h4"
          >
            Field
          </Typography>
        )}
        <Box>
          {adminAccess && <NavBarNotifications />}
          <NavBarMenu
            // highligtFirst={!isMobile}
            items={[
              {
                title: 'Admin',
                icon: <AdminPanelSettingsIcon fontSize="medium" />,
                onClick: () => {
                  // navigate('/admin');
                  admin();
                },
              },
              ...(iotAccess
                ? [
                    {
                      title: 'Opret station',
                      icon: <AddLocationAltIcon fontSize="medium" />,
                      onClick: () => {
                        // navigate('/field/stamdata');
                        createStamdata();
                      },
                    },
                  ]
                : []),
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

        {/* <Typography
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          variant="h4"
        >
          Opret station
        </Typography> */}

        <Box>
          {/* {adminAccess && <NavBarNotifications />} */}
          <NavBarMenu />
        </Box>
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
            // highligtFirst={!isMobile}
            items={[
              {
                title: 'Field',
                icon: <BuildCircleIcon fontSize="medium" />,
                onClick: () => {
                  // navigate('/field');
                  field();
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
                  // navigate(`/field/location/${metadata?.loc_id}/${metadata?.ts_id}`);
                  station(metadata?.loc_id, metadata?.ts_id);
                },
              },
              {
                title: 'Field',
                icon: <BuildCircleIcon fontSize="medium" />,
                onClick: () => {
                  // navigate('/field');
                  field();
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