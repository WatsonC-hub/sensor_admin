import {
  AddCircle,
  Menu,
  PhotoLibraryRounded,
  PlaylistAddCheck,
  StraightenRounded,
  Edit,
  Router,
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
  Typography,
} from '@mui/material';
import {useAtom} from 'jotai';
import React, {ReactNode} from 'react';
import FunctionsIcon from '@mui/icons-material/Functions';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useStationPages} from '~/hooks/useQueryStateParameters';
import PersonIcon from '@mui/icons-material/Person';
import BackpackIcon from '@mui/icons-material/Backpack';
import KeyIcon from '@mui/icons-material/Key';
import {drawerOpenAtom} from '~/state/atoms';
import {useAppContext} from '~/state/contexts';
import {metadataQueryOptions, useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
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
import MinimalSelect from './MinimalSelect';

const drawerWidth = 240;

type Item = {
  text: string;
  items?: Item[];
  page: StationPages;
  icon: ReactNode;
  onHover?: () => void;
  requiredTsId: boolean;
  disabled?: boolean;
};

type DrawerItems = {
  text?: string;
  items: Item[];
  disabled?: boolean;
  settings?: {
    icon: ReactNode;
    page: StationPages;
    disabled?: boolean;
    requiredTsId: boolean;
    onHover?: () => void;
  };
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
    queryClient.prefetchQuery({...options, staleTime: 1000 * 10});
  };

  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const open = isMonitor || openAtom;

  const items: DrawerItems[] = [
    {
      text: 'Tidsserie',
      settings: {
        icon: <Edit />,
        page: stationPages.GENERELTIDSSERIE,
        requiredTsId: true,
        disabled: metadata?.calculated || !metadata?.ts_id,
        onHover: () => handlePrefetch(metadataQueryOptions(ts_id)),
      },
      items: [
        {
          text: 'Kontrol',
          page: stationPages.PEJLING,
          icon: <AddCircle />,
          requiredTsId: false,
          onHover: () => handlePrefetch(pejlingGetOptions(ts_id)),
        },
        {
          text: 'Tilsyn',
          page: stationPages.TILSYN,
          icon: <PlaylistAddCheck />,
          requiredTsId: true,
          disabled: metadata?.calculated,
          onHover: () => handlePrefetch(tilsynGetOptions(ts_id)),
        },
        {
          text: 'Målepunkt',
          page: stationPages.MAALEPUNKT,
          icon: <StraightenRounded />,
          requiredTsId: true,
          disabled: metadata?.tstype_id != 1 || metadata?.calculated,
          onHover: () => handlePrefetch(getMaalepunktOptions(ts_id)),
        },
        {
          text: 'Udstyr',
          page: stationPages.GENERELTUDSTYR,
          icon: <Router />,
          requiredTsId: true,
          disabled: metadata?.calculated,
          onHover: () => handlePrefetch(metadataQueryOptions(ts_id)),
        },
        {
          text: 'Juster data',
          page: stationPages.JUSTERINGER,
          icon: <QueryStatsIcon />,
          requiredTsId: true,
          disabled: !user?.QAPermission || metadata?.calculated,
          onHover: () => handlePrefetch(getQAHistoryOptions(ts_id)),
        },
        {
          text: 'Juster advarsler',
          page: stationPages.ALGORITHMS,
          icon: <FunctionsIcon />,
          requiredTsId: true,
          disabled: !user?.QAPermission || metadata?.calculated,
          onHover: () => handlePrefetch(getAlgorithmOptions(ts_id)),
        },
        // {
        //   text: 'Stamdata',
        //   page: stationPages.GENERELTIDSSERIE,
        //   icon: <Edit />,
        //   requiredTsId: true,
        //   onHover: () => handlePrefetch(metadataQueryOptions(ts_id)),
        // },
      ],
    },

    {
      text: 'Lokation',
      settings: {
        page: stationPages.GENERELTLOKATION,
        icon: <Edit />,
        requiredTsId: false,
        onHover: () => handlePrefetch(metadataQueryOptions(ts_id)),
      },
      items: [
        {
          text: 'Billeder',
          page: stationPages.BILLEDER,
          icon: <PhotoLibraryRounded />,
          requiredTsId: false,
          onHover: () => handlePrefetch(getImageOptions(loc_id, 'images', 'station')),
        },

        {
          text: 'Kontakter',
          page: stationPages.KONTAKTER,
          icon: <PersonIcon />,
          requiredTsId: false,
          disabled: !user?.contactAndKeysPermission,
          onHover: () => handlePrefetch(ContactInfoGetOptions(loc_id)),
        },
        {
          text: 'Nøgler',
          page: stationPages.NØGLER,
          icon: <KeyIcon />,
          requiredTsId: false,
          disabled: !user?.contactAndKeysPermission,
          onHover: () => handlePrefetch(LocationAccessGetOptions(loc_id)),
        },
        {
          text: 'Huskeliste',
          page: stationPages.HUSKELISTE,
          icon: <BackpackIcon />,
          requiredTsId: false,
          disabled: !user?.ressourcePermission,
          onHover: () => handlePrefetch(getRessourcerOptions(loc_id)),
        },
      ],
    },
  ];

  const filteredItems = items
    .filter((category) =>
      category.items.some((item) => (!ts_id && !item.requiredTsId ? true : ts_id))
    )
    .filter((category) => category.disabled == undefined || !category.disabled);

  const drawerItems = filteredItems.map((category) => {
    return (
      <>
        {open && (
          <ListItem
            key={category.text}
            sx={{
              borderRadius: '9999px',
              pb: 0,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <ListItemText sx={{color: 'white', fontSize: 'bold'}} primary={category.text} />
            {category.settings && !category.settings.disabled && (
              <ListItemIcon
                sx={{
                  color: navIconStyle(pageToShow === category.settings.page),
                  minWidth: 0,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (category.settings) setPageToShow(category.settings.page);
                  if (open) toggleDrawer(false);
                }}
              >
                {category.settings.icon}
              </ListItemIcon>
            )}
          </ListItem>
        )}
        {category.items
          .filter((item) => item.disabled == undefined || !item.disabled)
          .map((item) => {
            if (!ts_id && item.requiredTsId) {
              return;
            }

            let timer = 0;

            const mouseEnter = () => {
              timer = setTimeout(item.onHover ? item.onHover : () => {}, 100);
            };

            const mouseLeave = () => {
              clearTimeout(timer);
            };

            return (
              <ListItem
                key={item.text}
                disablePadding
                onMouseEnter={mouseEnter}
                onMouseLeave={mouseLeave}
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
  const {data: locationdata} = useLocationData();
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
        <Box pt={2} mx={'auto'}>
          {!isMobile && <MinimalSelect />}
          {isMobile && (
            <Typography
              textOverflow="ellipsis"
              overflow="hidden"
              px={2}
              whiteSpace="wrap"
              color="white"
            >
              {locationdata?.loc_name}
            </Typography>
          )}
        </Box>
        <ClickAwayListener onClickAway={() => open && toggleDrawer(false)}>
          <Box sx={{overflowY: 'auto', overflowX: 'hidden', p: 0}}>{children}</Box>
        </ClickAwayListener>
      </Drawer>
    </Box>
  );
};

export default StationDrawer;
