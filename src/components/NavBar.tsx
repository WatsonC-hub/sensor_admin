import {MapRounded, Person, Menu as MenuIcon, Help, History} from '@mui/icons-material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PlaceIcon from '@mui/icons-material/Place';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import {
  AppBar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';

import {matchQuery, useQueryClient} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import {useState, ReactNode, MouseEventHandler} from 'react';
// import {useNavigate} from 'react-router-dom';

import {apiClient} from '~/apiClient';
import LogoSvg from '~/calypso.svg?react';
import {appBarHeight} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import SmallLogo from '~/logo.svg?react';
import {drawerOpenAtom} from '~/state/atoms';
import CloseIcon from '@mui/icons-material/Close';
import Button from './Button';
import {useDisplayState} from '~/hooks/ui';
import {useNavigate} from 'react-router-dom';
import {userQueryOptions} from '~/features/auth/useUser';
import {toast} from 'react-toastify';
import CaptureDialog from './CaptureDialog';

const LogOut = ({children}: {children?: ReactNode}) => {
  const queryClient = useQueryClient();
  const {home} = useNavigationFunctions();

  const handleLogout = async () => {
    await apiClient.get('/auth/logout/secure');
    queryClient.removeQueries({
      predicate: (query) => !matchQuery({queryKey: userQueryOptions.queryKey}, query),
    });
    await queryClient.invalidateQueries({queryKey: userQueryOptions.queryKey});
    home();
  };

  return (
    <Box
      onClick={handleLogout}
      width={'100%'}
      sx={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
    >
      {children}
    </Box>
  );
};

const HomeButton = () => {
  const {home} = useNavigationFunctions();

  return (
    <Tooltip title="Tilbage til kortet" arrow>
      <IconButton
        color="inherit"
        onClick={() => {
          home();
        }}
        size="large"
      >
        <MapRounded />
      </IconButton>
    </Tooltip>
  );
};

const AppBarLayout = ({children, zIndex}: {children?: ReactNode; zIndex?: number}) => {
  return (
    <AppBar position="sticky" enableColorOnDark sx={{zIndex: zIndex}}>
      <Toolbar
        sx={{
          height: appBarHeight,
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

// const NavBarNotifications = () => {
//   const {adminNotifikationer} = useNavigationFunctions();

//   const {data} = useNotificationOverview();

//   return (
//     <Badge
//       badgeContent={
//         data?.filter(
//           (item) =>
//             item.flag === 3 &&
//             item.is_customer_service === false &&
//             moment(item.dato).diff(moment(), 'hours') > -24
//         ).length
//       }
//       color="error"
//       onClick={() => {
//         if (!window.location.pathname.includes('/notifikationer')) {
//           adminNotifikationer();
//         }
//       }}
//       sx={{cursor: 'pointer', mr: 2, '& .MuiBadge-badge': {fontSize: 10}}}
//     >
//       <Badge
//         badgeContent={
//           data?.filter((item) => item.flag === 3 && item.is_customer_service === false).length
//         }
//         color="error"
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'right',
//         }}
//         sx={{'& .MuiBadge-badge': {fontSize: 10}}}
//       >
//         <NotificationsIcon />
//       </Badge>
//     </Badge>
//   );
// };

const NavBarMenu = ({
  highligtFirst,
  items,
  disableLogout = false,
  disableProfile = true,
}: {
  highligtFirst?: boolean;
  items?: {title: string; icon: ReactNode; onClick: () => void}[];
  disableLogout?: boolean;
  disableProfile?: boolean;
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
        <Button bttype={'primary'} onClick={items?.[0].onClick} startIcon={items?.[0].icon}>
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

        {!disableProfile && (
          <MenuItem
            key="profile"
            onClick={() => {
              window.location.href = 'https://admin.watsonc.dk/profile';
            }}
          >
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            Profil
          </MenuItem>
        )}

        <MenuItem
          key="guides"
          onClick={() => {
            window.open('https://www.watsonc.dk/guides/', '_blank');
          }}
        >
          <ListItemIcon>
            <Help />
          </ListItemIcon>
          Guides
        </MenuItem>
        <MenuItem
          key="old-version"
          onClick={() => {
            window.location.href = 'https://sensor-old.watsonc.dk';
          }}
        >
          <ListItemIcon>
            <History />
          </ListItemIcon>
          Gamle version
        </MenuItem>
        {!disableLogout && (
          <MenuItem onClick={handleClose}>
            <LogOut>
              <ListItemIcon>
                <LogoutIcon fontSize="medium" />
              </ListItemIcon>
              {'Logout'}
            </LogOut>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const Logo = () => {
  const {isMobile} = useBreakpoints();

  return isMobile ? <SmallLogo /> : <LogoSvg />;
};

const StationDrawerMenu = () => {
  const [open, setOpen] = useAtom(drawerOpenAtom);
  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={() => {
          setOpen(!open);
        }}
        size="large"
      >
        <MenuIcon />
      </IconButton>
    </Box>
  );
};

const GoBack = () => {
  const navigate = useNavigate();

  return (
    <IconButton
      color="inherit"
      onClick={() => {
        navigate(-1);
      }}
      size="large"
    >
      <KeyboardBackspaceIcon />
    </IconButton>
  );
};

const Close = ({onClick}: {onClick: () => void}) => {
  return (
    <IconButton color="inherit" onClick={onClick} size="large">
      <CloseIcon />
    </IconButton>
  );
};

const LocationList = () => {
  const [loc_list, setLocList] = useDisplayState((state) => [state.loc_list, state.setLocList]);
  const {isMobile} = useBreakpoints();

  return (
    <Button
      sx={{
        color: loc_list ? 'secondary.main' : 'inherit',
        minWidth: isMobile ? 0 : undefined,
        minHeight: isMobile ? 0 : undefined,
        px: isMobile ? 1 : undefined,
      }}
      bttype={'primary'}
      onClick={() => setLocList(!loc_list)}
      startIcon={!isMobile && <PlaceIcon />}
    >
      {isMobile && <PlaceIcon />}
      {!isMobile && 'Lokationsliste'}
    </Button>
  );
};

const TripList = () => {
  const [trip_list, setTripList] = useDisplayState((state) => [state.trip_list, state.setTripList]);
  const {isMobile} = useBreakpoints();
  return (
    <Button
      sx={{
        color: trip_list ? 'secondary.main' : 'inherit',
        minWidth: isMobile ? 0 : undefined,
        minHeight: isMobile ? 0 : undefined,
        px: isMobile ? 1 : undefined,
      }}
      bttype={'primary'}
      onClick={() => setTripList(!trip_list)}
      startIcon={!isMobile && <DirectionsCarIcon />}
    >
      {isMobile && <DirectionsCarIcon />}
      {!isMobile && 'Ture'}
    </Button>
  );
};

const ScannerAsTitle = () => {
  const [open, setOpen] = useState(false);
  async function getData(labelid: string | number) {
    const {data} = await apiClient.get(`/sensor_field/calypso_id/${labelid}`);
    return data;
  }

  const {location, station, boreholeIntake} = useNavigationFunctions();

  const handleClose = () => {
    setOpen(false);
  };

  const handleScan = async (data: any, calypso_id: number | null) => {
    if (!calypso_id) {
      toast.error('QR-koden er ikke gyldig', {autoClose: 2000});
      handleClose();
      return;
    }

    try {
      const resp = await getData(calypso_id);

      if (resp.loc_id) {
        if (resp.ts_id) {
          location(resp.loc_id, true);
          station(resp.ts_id);
        } else {
          location(resp.loc_id, true);
        }
      } else if (resp.boreholeno) {
        if (resp.intakeno) {
          boreholeIntake(resp.boreholeno, resp.intakeno);
        }
      } else {
        toast.error('Ukendt fejl', {autoClose: 2000});
      }
      handleClose();
    } catch (e: any) {
      toast.error(e.response?.data?.detail ? e.response?.data?.detail : 'Ukendt fejl', {
        autoClose: 2000,
      });
      handleClose();
    }
  };

  return (
    <>
      <IconButton
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        color="inherit"
        onClick={() => setOpen(true)}
        size="large"
      >
        <QrCodeScannerIcon />
      </IconButton>
      {open && <CaptureDialog open={open} handleClose={handleClose} handleScan={handleScan} />}
    </>
  );
};

const Title = ({title}: {title: string}) => {
  const {isMobile} = useBreakpoints();
  return (
    <Box display={'flex'} justifyContent="center" alignContent="center">
      <Typography sx={{}} variant={isMobile ? 'h6' : 'h4'}>
        {title}
      </Typography>
      {/* <LinkableTooltip
        fieldDescriptionText="Læs mere om stamdata"
        sx={{pb: 0, pl: 0.5, color: 'white'}}
      /> */}
    </Box>
  );
};

const NavBar = ({children, zIndex}: {children?: ReactNode; zIndex?: number}) => {
  return <AppBarLayout zIndex={zIndex}>{children}</AppBarLayout>;
};

NavBar.Logo = Logo;
NavBar.GoBack = GoBack;
NavBar.Menu = NavBarMenu;
NavBar.Home = HomeButton;
NavBar.Title = Title;
NavBar.Scanner = ScannerAsTitle;
NavBar.Close = Close;
NavBar.LocationList = LocationList;
NavBar.TripList = TripList;
NavBar.StationDrawerMenu = StationDrawerMenu;

export default NavBar;
