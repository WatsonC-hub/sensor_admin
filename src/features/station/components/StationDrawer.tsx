import AddIcon from '@mui/icons-material/Add';

import {
  AddCircle,
  PhotoLibraryRounded,
  PlaylistAddCheck,
  StraightenRounded,
  Edit,
  Router,
  Settings,
  PriorityHigh,
} from '@mui/icons-material';
import AlarmIcon from '@mui/icons-material/Alarm';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
  ClickAwayListener,
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
import {UseQueryOptions} from '@tanstack/react-query';
import {queryClient} from '~/queryClient';
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
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import TooltipWrapper from '~/components/TooltipWrapper';
import {timeseriesMeasureSampleSendOptions} from '../api/useTimeseriesMeasureSampleSend';
import {prefetchDmpAllowedMapList} from '../api/useDmpAllowedMapList';
import {alarmGetOptions} from '../alarms/api/useAlarm';
import ProgressLabel from './ProgressLabel';
import {useProgress} from '~/hooks/query/stationProgress';

const drawerWidth = 200;

type Item = {
  text: string;
  items?: Item[];
  page: StationPages;
  icon: ReactNode;
  onHover?: () => void;
  requiredTsId: boolean;
  disabled?: boolean;
  tooltip?: string;
  progress?: number;
  maxProgress?: number;
};

type DrawerItems = {
  text?: string;
  items: Item[];
  disabled?: boolean;
  settings?: Array<{
    icon: ReactNode;
    page: StationPages;
    disabled?: boolean;
    requiredTsId: boolean;
    onHover?: () => void;
    onClick?: () => void;
  }>;
};

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};
const StationDrawer = () => {
  const {ts_id, loc_id} = useAppContext(['loc_id'], ['ts_id']);
  const [pageToShow, setPageToShow] = useStationPages();
  const [openAtom, setOpen] = useAtom(drawerOpenAtom);
  const {isTouch} = useBreakpoints();
  const {data: metadata} = useTimeseriesData();
  const {data: locationdata} = useLocationData();
  const {data: progress} = useProgress(ts_id);

  const {
    superUser,
    features: {iotAccess, alarms, contacts, keys: accessKeys, ressources},
  } = useUser();
  const {createStamdata} = useNavigationFunctions();

  const handlePrefetch = <TData extends object, TError extends Error>(
    options: UseQueryOptions<TData, TError>
  ) => {
    queryClient.prefetchQuery({...options, staleTime: 1000 * 10});
  };

  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const open = openAtom;

  const items: DrawerItems[] = [
    {
      text: 'Tidsserie',
      settings: [
        {
          icon: <AddIcon />,
          page: stationPages.STAMDATA,
          requiredTsId: false,
          onClick: () => {
            createStamdata({
              state: {
                ...(ts_id ? metadata : locationdata),
                initial_project_no: ts_id ? metadata?.projectno : locationdata?.projectno,
              },
            });
          },
        },
        {
          icon: <Edit />,
          page: stationPages.GENERELTIDSSERIE,
          requiredTsId: true,
          disabled: metadata?.calculated || !metadata?.ts_id,
          onHover: () => handlePrefetch(metadataQueryOptions(ts_id)),
        },
      ],
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
          // tooltip: 'På denne side kan du se og redigere tilsyn for din tidsserie.',
        },
        {
          text: 'Målepunkt',
          page: stationPages.MAALEPUNKT,
          icon: <StraightenRounded />,
          requiredTsId: true,
          disabled: metadata?.tstype_id != 1 || metadata?.calculated,
          onHover: () => handlePrefetch(getMaalepunktOptions(ts_id!)),
          // tooltip: 'På denne side kan du se og redigere målepunkter til din tidsserie.',
        },
        {
          text: 'Udstyr',
          page: stationPages.GENERELTUDSTYR,
          icon: <Router />,
          requiredTsId: true,
          disabled: metadata?.calculated,
          onHover: () => handlePrefetch(metadataQueryOptions(ts_id)),
          // tooltip: 'På denne side kan du se og redigere udstyr til din tidsserie.',
        },
        {
          text: 'Juster data',
          page: stationPages.JUSTERINGER,
          icon: <QueryStatsIcon />,
          requiredTsId: true,
          disabled: !iotAccess || metadata?.calculated,
          onHover: () => handlePrefetch(getQAHistoryOptions(ts_id!)),
          tooltip:
            'På denne side kan du kvalitetssikre din tidsserie ved blandt andet at justere data, fjerne data og se historik for ændringer.',
        },
        {
          text: 'Juster advarsler',
          page: stationPages.ALGORITHMS,
          icon: <FunctionsIcon />,
          requiredTsId: true,
          disabled: !iotAccess,
          onHover: () => handlePrefetch(getAlgorithmOptions(ts_id!)),
          tooltip: 'På denne side kan du justere advarsler for din tidsserie.',
        },
        {
          text: 'Alarmer',
          page: stationPages.ALARM,
          icon: <AlarmIcon />,
          requiredTsId: true,
          onHover: () => handlePrefetch(alarmGetOptions(ts_id)),
          disabled: !alarms,
        },
        {
          text: 'Konfiguration',
          page: stationPages.TIDSSERIEKONFIGURATION,
          icon: <Settings />,
          requiredTsId: true,
          onHover: () => {
            if (metadata?.unit_uuid && metadata?.calculated === false) {
              handlePrefetch(timeseriesMeasureSampleSendOptions(ts_id!));
            }
            prefetchDmpAllowedMapList();
          },
          tooltip:
            'På denne side kan du konfigurere din tidsserie, såsom at ændre måleinterval eller sendeinterval.',
        },
      ],
    },

    {
      text: 'Lokation',
      settings: [
        {
          page: stationPages.GENERELTLOKATION,
          icon: <Edit />,
          requiredTsId: false,
          onHover: () => handlePrefetch(metadataQueryOptions(ts_id)),
        },
      ],
      items: [
        {
          text: 'Billeder',
          page: stationPages.BILLEDER,
          icon: <PhotoLibraryRounded />,
          requiredTsId: false,
          onHover: () => handlePrefetch(getImageOptions(loc_id, 'images', 'station')),
          progress: progress?.images == false ? 0 : undefined,
        },

        {
          text: 'Kontakter',
          page: stationPages.KONTAKTER,
          icon: <PersonIcon />,
          requiredTsId: false,
          disabled: !contacts,
          onHover: () => handlePrefetch(ContactInfoGetOptions(loc_id)),
        },
        {
          text: 'Nøgler',
          page: stationPages.NØGLER,
          icon: <KeyIcon />,
          requiredTsId: false,
          disabled: !accessKeys,
          onHover: () => handlePrefetch(LocationAccessGetOptions(loc_id)),
          progress: progress?.adgangsforhold == false ? 0 : undefined,
        },
        {
          text: 'Huskeliste',
          page: stationPages.HUSKELISTE,
          icon: <BackpackIcon />,
          requiredTsId: false,
          disabled: !ressources,
          onHover: () => handlePrefetch(getRessourcerOptions(loc_id)),
          progress: progress?.ressourcer == false ? 0 : undefined,
        },
        {
          text: 'Konfiguration',
          page: stationPages.LOKATIONKONFIGURATION,
          icon: <Settings />,
          requiredTsId: false,
          disabled: !superUser,
          // tooltip:
          //   'På denne side kan du konfigurere din lokation, såsom at ændre måleinterval eller sendeinterval.',
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
      <Box key={category.text}>
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
          <Box alignItems={'center'} display="flex" gap={1}>
            {category.settings &&
              category.settings
                .filter((setting) => setting?.disabled == false || setting?.disabled == undefined)
                .map((setting, index) => (
                  <ListItemIcon
                    key={index}
                    sx={{
                      color: navIconStyle(pageToShow === setting.page),
                      minWidth: 0,
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      if (setting.onClick) {
                        setting.onClick();
                      } else setPageToShow(setting.page);
                      if (open) toggleDrawer(false);
                    }}
                  >
                    {setting.icon}
                  </ListItemIcon>
                ))}
          </Box>
        </ListItem>

        {category.items
          .filter((item) => item.disabled == undefined || !item.disabled)
          .map((item) => {
            if (!ts_id && item.requiredTsId) {
              return;
            }

            let timer = 0;

            const mouseEnter = () => {
              timer = setTimeout(
                item.onHover && pageToShow !== item.page ? item.onHover : () => {},
                100
              );
            };

            const mouseLeave = () => {
              clearTimeout(timer);
            };

            const Wrapper = item.tooltip ? TooltipWrapper : React.Fragment;

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
                <ListItemButton
                  sx={{
                    borderRadius: '9999px',
                    color: navIconStyle(pageToShow === item.page),
                    py: 0,
                    pr: 0,
                    justifyContent: 'space-between',
                  }}
                  onClick={() => {
                    setPageToShow(item.page);
                    if (open) toggleDrawer(false);
                  }}
                >
                  <ListItemIcon sx={{color: navIconStyle(pageToShow === item.page), minWidth: 42}}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText>
                    <Wrapper
                      {...(item.tooltip ? {description: item.tooltip, withIcon: false} : {})}
                    >
                      {item.text}
                    </Wrapper>
                  </ListItemText>
                  {item.progress != undefined && item.maxProgress != undefined && (
                    <ProgressLabel value={item.progress} max={item.maxProgress} />
                  )}
                  {item.progress != undefined && !item.maxProgress && (
                    <PriorityHigh color="secondary" />
                  )}
                  {/* <ListItemIcon
                    sx={{
                      color: navIconStyle(pageToShow === item.page),
                      width: 24,
                      py: 0,
                      pr: 1,
                      justifyContent: 'end',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon> */}
                </ListItemButton>
              </ListItem>
            );
          })}
        {filteredItems.indexOf(category) !== filteredItems.length - 1 && <Divider />}
      </Box>
    );
  });

  if (isTouch) {
    return (
      <Layout variant="temporary">
        <List>{drawerItems}</List>
      </Layout>
    );
  }

  return (
    <Layout variant="permanent">
      <List>{drawerItems}</List>
    </Layout>
  );

  // return (
  //   <Layout variant="permanent">
  //     <Toolbar disableGutters sx={{justifyContent: 'center'}} onClick={() => toggleDrawer(!open)}>
  //       <IconButton sx={{color: 'white'}}>
  //         <Menu />
  //       </IconButton>
  //     </Toolbar>
  //     <List>{drawerItems}</List>
  //   </Layout>
  // );
};

type LayoutProps = {
  children: ReactNode;
  variant?: 'temporary' | 'permanent';
};

const Layout = ({children, variant}: LayoutProps) => {
  const [openAtom, setOpen] = useAtom(drawerOpenAtom);
  const {data: locationdata} = useLocationData();
  const {isTouch} = useBreakpoints();
  const open = openAtom;
  const toggleDrawer = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      sx={{
        width: drawerWidth,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          position: 'relative',
          backgroundColor: 'primary.main',
        },
      }}
    >
      <Box pt={2} px={1}>
        {/* <TooltipWrapper description="" color="white"> */}
        {!isTouch && <MinimalSelect />}
        {isTouch && (
          <Typography textOverflow="ellipsis" overflow="hidden" whiteSpace="wrap" color="white">
            {locationdata?.loc_name}
          </Typography>
        )}
        {/* </TooltipWrapper> */}
      </Box>
      <ClickAwayListener onClickAway={() => open && toggleDrawer(false)}>
        <Box sx={{overflowY: 'auto', overflowX: 'hidden', p: 0}}>{children}</Box>
      </ClickAwayListener>
    </Drawer>
  );
};

export default StationDrawer;
