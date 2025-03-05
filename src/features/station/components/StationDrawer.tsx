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
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import PersonIcon from '@mui/icons-material/Person';
import BackpackIcon from '@mui/icons-material/Backpack';
import KeyIcon from '@mui/icons-material/Key';
import {drawerOpenAtom} from '~/state/atoms';
import {useAppContext} from '~/state/contexts';
import {metadataQueryOptions, useTimeseriesData} from '~/hooks/query/useMetadata';
import {useUser} from '~/features/auth/useUser';
import {OmitKeyof, UseQueryOptions} from '@tanstack/react-query';
import {APIError, queryClient} from '~/queryClient';
import {pejlingGetOptions} from '~/features/pejling/api/usePejling';
import {tilsynGetOptions} from '~/features/tilsyn/api/useTilsyn';
import {getMaalepunktOptions} from '~/hooks/query/useMaalepunkt';
import {ContactInfoGetOptions} from '~/features/stamdata/api/useContactInfo';
import {LocationAccessGetOptions} from '~/features/stamdata/api/useLocationAccess';
import {getRessourcerOptions} from '~/features/stamdata/api/useRessourcer';
import {getQAHistoryOptions} from '~/features/kvalitetssikring/api/useQAHistory';
import {getAlgorithmOptions} from '~/features/kvalitetssikring/api/useAlgorithms';
import {getImageOptions} from '../api/useImages';
import {stationPages, StationPages} from '~/helpers/EnumHelper';

const drawerWidth = 240;

type Item = {
  text: string;
  items?: Item[];
  page: StationPages;
  icon: ReactNode;
  onHover?: () => void;
  requiredTsId: boolean;
  calculated?: boolean;
  admin?: boolean;
  contactAndKeyAccess?: boolean;
  ressourceAccess?: boolean;
};

type DrawerItems = {
  text?: string;
  items: Item[];
  admin?: boolean;
  calculated?: boolean;
};

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};
const StationDrawer = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id'], ['ts_id']);
  const [pageToShow, setPageToShow] = useStationPages();
  const [openAtom, setOpen] = useAtom(drawerOpenAtom);
  const {isMobile, isMonitor} = useBreakpoints();
  const {data: metadata} = useTimeseriesData();
  const user = useUser();

  const handlePrefetch = <TData extends object>(
    options: OmitKeyof<UseQueryOptions<TData, APIError>, 'queryFn'>
  ) => {
    queryClient.prefetchQuery({...options});
  };

  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const open = isMonitor || openAtom;

  const items: DrawerItems[] = [
    {
      text: 'Tidsserie',
      items: [
        {
          text: 'Stamdata',
          page: stationPages.GENERELTIDSSERIE,
          icon: <QuestionMarkIcon />,
          requiredTsId: true,
          onHover: () => {
            const options = metadataQueryOptions(ts_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Pejling',
          page: stationPages.PEJLING,
          icon: <AddCircle />,
          requiredTsId: false,
          onHover: () => {
            const options = pejlingGetOptions(ts_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Tilsyn',
          page: stationPages.TILSYN,
          icon: <PlaylistAddCheck />,
          requiredTsId: true,
          calculated: metadata?.calculated,
          onHover: () => {
            const options = tilsynGetOptions(ts_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Målepunkt',
          page: stationPages.MAALEPUNKT,
          icon: <StraightenRounded />,
          requiredTsId: true,
          onHover: () => {
            const options = getMaalepunktOptions(ts_id);
            handlePrefetch(options);
          },
        },
      ],
    },
    {
      text: 'Udstyr',
      items: [
        {
          text: 'Stamdata',
          page: stationPages.GENERELTUDSTYR,
          icon: <QuestionMarkIcon />,
          requiredTsId: true,
          onHover: () => {
            const options = metadataQueryOptions(ts_id);
            handlePrefetch(options);
          },
        },
      ],
    },
    {
      text: 'Lokation',
      items: [
        {
          text: 'Stamdata',
          page: stationPages.GENERELTLOKATION,
          icon: <QuestionMarkIcon />,
          requiredTsId: false,
          onHover: () => {
            const options = metadataQueryOptions(ts_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Kontakter',
          page: stationPages.KONTAKTER,
          icon: <PersonIcon />,
          requiredTsId: false,
          contactAndKeyAccess: user?.contactAndKeysPermission,
          onHover: () => {
            const options = ContactInfoGetOptions(loc_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Nøgler',
          page: stationPages.NØGLER,
          icon: <KeyIcon />,
          requiredTsId: false,
          contactAndKeyAccess: user?.contactAndKeysPermission,
          onHover: () => {
            const options = LocationAccessGetOptions(loc_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Huskeliste',
          page: stationPages.HUSKELISTE,
          icon: <BackpackIcon />,
          requiredTsId: false,
          ressourceAccess: user?.ressourcePermission,
          onHover: () => {
            const options = getRessourcerOptions(loc_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Billeder',
          page: stationPages.BILLEDER,
          icon: <PhotoLibraryRounded />,
          requiredTsId: false,
          onHover: () => {
            const options = getImageOptions(loc_id, 'images', 'station');
            handlePrefetch(options);
          },
        },
      ],
    },
    {
      text: 'Kvalitetssikring',
      admin: user?.QAPermission,
      calculated: metadata?.calculated,
      items: [
        {
          text: 'Justeringer',
          page: stationPages.JUSTERINGER,
          icon: <QueryStatsIcon />,
          requiredTsId: true,
          onHover: () => {
            const options = getQAHistoryOptions(ts_id);
            handlePrefetch(options);
          },
        },
        {
          text: 'Algoritmer',
          page: stationPages.ALGORITHMS,
          icon: <FunctionsIcon />,
          requiredTsId: true,
          onHover: () => {
            const options = getAlgorithmOptions(ts_id);
            handlePrefetch(options);
          },
        },
      ],
    },
  ];

  const filteredItems = items
    .filter((category) =>
      category.items.some((item) => (!ts_id && !item.requiredTsId ? true : ts_id))
    )
    .filter((category) => category.admin !== false && category.calculated !== true);

  const drawerItems = filteredItems.map((category) => {
    return (
      <>
        {open && (
          <ListItem key={category.text} sx={{borderRadius: '9999px', pb: 0}}>
            <ListItemText sx={{color: 'white'}} primary={category.text} />
          </ListItem>
        )}
        {category.items
          .filter(
            (item) =>
              item.contactAndKeyAccess !== false &&
              item.ressourceAccess !== false &&
              (item.calculated === undefined || item.calculated === false)
          )
          .map((item) => {
            if (!ts_id && item.requiredTsId) {
              return;
            }

            return (
              <ListItem
                key={item.text}
                disablePadding
                onMouseEnter={item.onHover}
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
        {filteredItems.indexOf(category) !== filteredItems.length - 1 && <Divider />}
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
