import {MapRounded, Person, Menu as MenuIcon} from '@mui/icons-material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
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

import {useQueryClient} from '@tanstack/react-query';
import {useAtom, useSetAtom} from 'jotai';
import {useState, ReactNode, MouseEventHandler} from 'react';
// import {useNavigate} from 'react-router-dom';

import {apiClient} from '~/apiClient';
import LogoSvg from '~/calypso.svg?react';
import {appBarHeight} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import SmallLogo from '~/logo.svg?react';
import {captureDialogAtom, drawerOpenAtom} from '~/state/atoms';

import Button from './Button';
import {useNavigate} from 'react-router-dom';

const LogOut = ({children}: {children?: ReactNode}) => {
  const queryClient = useQueryClient();
  const {home} = useNavigationFunctions();

  const handleLogout = () => {
    home();
    apiClient.get('/auth/logout/secure');
    queryClient.clear();
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
  const {field} = useNavigationFunctions();

  return (
    <Tooltip title="Tilbage til kortet" arrow>
      <IconButton
        color="inherit"
        onClick={() => {
          field();
        }}
        size="large"
      >
        <MapRounded />
      </IconButton>
    </Tooltip>
  );
};

const AppBarLayout = ({children}: {children?: ReactNode}) => {
  return (
    <AppBar position="sticky" enableColorOnDark sx={{zIndex: (theme) => theme.zIndex.drawer + 1}}>
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
}: {
  highligtFirst?: boolean;
  items?: {title: string; icon: ReactNode; onClick: () => void}[];
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

const ScannerAsTitle = () => {
  const setOpenQRScanner = useSetAtom(captureDialogAtom);

  return (
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
  );
};

const Title = ({title}: {title: string}) => {
  const {isMobile} = useBreakpoints();
  return (
    <>
      <Typography
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        variant={isMobile ? 'h6' : 'h4'}
      >
        {title}
      </Typography>
    </>
  );
};

const NavBar = ({children}: {children?: ReactNode}) => {
  return <AppBarLayout>{children}</AppBarLayout>;
};

NavBar.Logo = Logo;
NavBar.GoBack = GoBack;
NavBar.Menu = NavBarMenu;
NavBar.Home = HomeButton;
NavBar.Title = Title;
NavBar.Scanner = ScannerAsTitle;
NavBar.StationDrawerMenu = StationDrawerMenu;

export default NavBar;
