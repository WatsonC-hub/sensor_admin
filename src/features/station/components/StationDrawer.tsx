import {
  AddCircle,
  Menu,
  PhotoLibraryRounded,
  PlaylistAddCheck,
  StraightenRounded,
} from '@mui/icons-material';
import {
  Drawer,
  Toolbar,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
  ClickAwayListener,
  Tooltip,
  IconButton,
} from '@mui/material';
import {useAtom} from 'jotai';
import React, {ReactNode} from 'react';
import FunctionsIcon from '@mui/icons-material/Functions';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import {StationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import PersonIcon from '@mui/icons-material/Person';
import BackpackIcon from '@mui/icons-material/Backpack';
import KeyIcon from '@mui/icons-material/Key';
import {drawerOpenAtom} from '~/state/atoms';
import {useAppContext} from '~/state/contexts';

const drawerWidth = 240;

type Item = {
  text: string;
  items?: Item[];
  page: StationPages;
  icon: ReactNode;
  requiredTsId: boolean;
};

type DrawerItems = {
  text?: string;
  items: Item[];
};

const items: DrawerItems[] = [
  {
    text: 'Tidsserie',
    items: [
      {
        text: 'Generelt',
        page: 'generelt tidsserie',
        icon: <QuestionMarkIcon />,
        requiredTsId: true,
      },
      {
        text: 'Pejling',
        page: 'pejling',
        icon: <AddCircle />,
        requiredTsId: false,
      },
      {
        text: 'Tilsyn',
        page: 'tilsyn',
        icon: <PlaylistAddCheck />,
        requiredTsId: true,
      },
      {
        text: 'Målepunkt',
        page: 'målepunkt',
        icon: <StraightenRounded />,
        requiredTsId: true,
      },
    ],
  },
  {
    text: 'Udstyr',
    items: [
      {
        text: 'Generelt',
        page: 'generelt udstyr',
        icon: <QuestionMarkIcon />,
        requiredTsId: true,
      },
      {
        text: 'Sendeinterval',
        page: 'sendeinterval',
        icon: <ScheduleSendIcon />,
        requiredTsId: true,
      },
    ],
  },
  {
    text: 'Lokation',
    items: [
      {
        text: 'Generelt',
        page: 'generelt lokation',
        icon: <QuestionMarkIcon />,
        requiredTsId: false,
      },
      {
        text: 'Kontakter',
        page: 'kontakter',
        icon: <PersonIcon />,
        requiredTsId: false,
      },
      {
        text: 'Nøgler',
        page: 'nøgler',
        icon: <KeyIcon />,
        requiredTsId: false,
      },
      {
        text: 'Huskeliste',
        page: 'huskeliste',
        icon: <BackpackIcon />,
        requiredTsId: false,
      },
      {
        text: 'Billeder',
        page: 'billeder',
        icon: <PhotoLibraryRounded />,
        requiredTsId: false,
      },
    ],
  },
  {
    text: 'Kvalitetssikring',
    items: [
      {
        text: 'Justeringer',
        page: 'justeringer',
        icon: <QueryStatsIcon />,
        requiredTsId: true,
      },
      {
        text: 'Algoritmer',
        page: 'algoritmer',
        icon: <FunctionsIcon />,
        requiredTsId: true,
      },
    ],
  },
];

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};
const StationDrawer = () => {
  const {ts_id} = useAppContext([], ['ts_id']);
  const [pageToShow, setPageToShow] = useStationPages();
  const [openAtom, setOpen] = useAtom(drawerOpenAtom);
  const {isMobile, isMonitor} = useBreakpoints();

  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const open = isMonitor || openAtom;

  /**
   * Loop alle kategorier igennem og genere items for hver kategori
   * Loop items igennem og generer en ListItem for hver side
   * Hvis siden er valgt, så vises den med en anden farve
   * Hvis telefon: skift navbar backspace med menu - Se station.tsx
   * Hvis Desktop vises menuen altid i rail eller full width
   * Clickawaylistener lukker menuen hvis der klikkes udenfor
   */
  const drawerItems = items
    .filter((category) =>
      category.items.some((item) => (!ts_id && !item.requiredTsId ? true : ts_id))
    )
    .map((category) => {
      return (
        <>
          {open && (
            <ListItem key={category.text} sx={{borderRadius: '9999px'}}>
              <ListItemText sx={{color: 'white'}} primary={category.text} />
            </ListItem>
          )}
          {category.items.map((item) => {
            if (!ts_id && item.requiredTsId) {
              return;
            }

            return (
              <ListItem
                key={item.text}
                disablePadding
                sx={{
                  borderRadius: '9999px',
                  py: 1,
                }}
              >
                <Tooltip title={!open ? item.text : ''} placement="right">
                  <ListItemButton
                    sx={{
                      borderRadius: '9999px',
                      color: navIconStyle(pageToShow === item.page),
                      py: 0,
                    }}
                    onClick={() => {
                      setPageToShow(item.page);
                      if (open) toggleDrawer(false);
                    }}
                  >
                    <ListItemIcon
                      sx={{color: navIconStyle(pageToShow === item.page), minWidth: 42}}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {open && <ListItemText>{item.text}</ListItemText>}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
          {items.indexOf(category) !== items.length - 1 && <Divider />}
        </>
      );
    });

  if (isMobile) {
    return (
      <Layout variant="temporary">
        <List>{drawerItems}</List>
      </Layout>
    );
  }

  if (isMonitor) {
    return (
      <Layout variant="permanent">
        <List>{drawerItems}</List>
      </Layout>
    );
  }

  return (
    <Layout variant="permanent">
      <Toolbar disableGutters sx={{justifyContent: 'center'}} onClick={() => toggleDrawer(!open)}>
        <IconButton sx={{color: 'white'}}>
          <Menu />
        </IconButton>
      </Toolbar>
      <List>{drawerItems}</List>
    </Layout>
  );
};

type LayoutProps = {
  children: ReactNode;
  variant?: 'temporary' | 'permanent';
};

const Layout = ({children, variant}: LayoutProps) => {
  const [openAtom, setOpen] = useAtom(drawerOpenAtom);

  const {isMonitor, isMobile} = useBreakpoints();
  const open = isMonitor || openAtom;
  const width = open ? drawerWidth : 48;
  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Box>
      <Drawer
        variant={variant}
        open={open}
        sx={{
          width: width,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: width,
            backgroundColor: 'primary.main',
            pt: '64px',
            pb: isMobile ? '64px' : '0px',
          },
        }}
      >
        <ClickAwayListener onClickAway={() => open && toggleDrawer(false)}>
          <Box sx={{overflowY: 'auto', overflowX: 'hidden', p: 0}}>{children}</Box>
        </ClickAwayListener>
      </Drawer>
    </Box>
  );
};

export default StationDrawer;
