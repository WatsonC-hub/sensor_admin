import {ConstructionRounded} from '@mui/icons-material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InboxIcon from '@mui/icons-material/MoveToInbox';
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
} from '@mui/material';
import {atom, useAtom} from 'jotai';
import React from 'react';

import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages, useEditTabState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

const drawerWidth = 240;

export const drawerOpenAtom = atom<boolean>(false);

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};
const StationDrawer = () => {
  const {ts_id} = useAppContext([], ['ts_id']);
  const [pageToShow, setPageToShow] = useStationPages();
  const [, setEditTab] = useEditTabState();
  const {adminKvalitetssikring} = useNavigationFunctions();
  const [open, setOpen] = useAtom(drawerOpenAtom);

  const udstyrItems = [
    {
      text: 'Stamdata',
      onClick: () => {
        setPageToShow(stationPages.STAMDATA);
        setEditTab('udstyr');
      },
      icon: <InboxIcon />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
    {
      text: 'Sendeinterval',
      onClick: () => {
        setPageToShow(stationPages.STAMDATA);
        setEditTab('udstyr');
      },
      icon: <InboxIcon />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
  ];

  const tidsserieItems = [
    {
      text: 'Stamdata',
      onClick: () => {
        setPageToShow(stationPages.STAMDATA);
        setEditTab('tidsserie');
      },
      icon: <AutoGraphIcon />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
    {
      text: 'Pejling',
      onClick: () => {
        setPageToShow(stationPages.PEJLING);
      },
      icon: <InboxIcon />,
      color: navIconStyle(pageToShow === 'pejling'),
    },
    {
      text: 'Tilsyn',
      onClick: () => {
        setPageToShow(stationPages.TILSYN);
      },
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === 'tilsyn'),
    },
    {
      text: 'Målepunkt',
      onClick: () => {
        setPageToShow(stationPages.STAMDATA);
        setEditTab('målepunkt');
      },
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === 'tilsyn'),
    },
    {
      text: 'Kvalitetssikring',
      onClick: () => {
        adminKvalitetssikring(ts_id!);
      },
      icon: <AutoGraphIcon />,
      // color: navIconStyle(pageToShow === 'kvalitetssikring'),
    },
  ];

  const lokationItems = [
    {
      text: 'Stamdata',
      onClick: () => {
        setPageToShow(stationPages.STAMDATA);
        setEditTab('lokation');
      },
      icon: <InboxIcon />,
      color: navIconStyle(pageToShow === 'pejling'),
    },
    {
      text: 'Kontakter',
      onClick: () => {
        setPageToShow(stationPages.STAMDATA);
        setEditTab('stationsinformation');
      },
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
    {
      text: 'Billeder',
      onClick: () => {
        setPageToShow(stationPages.BILLEDER);
      },
      icon: <AutoGraphIcon />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
  ];
  const {isMobile} = useBreakpoints();
  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {width: drawerWidth, boxSizing: 'border-box'},
      }}
      ModalProps={{
        onClick: () => {
          setOpen(false);
        },
        onBackdropClick: () => {
          setOpen(false);
        },
      }}
    >
      <Toolbar />
      <Box sx={{overflow: 'auto'}}>
        <List>
          <ListItem key={123} sx={{borderRadius: '9999px'}}>
            <ListItemText primary="Lokation" />
          </ListItem>

          {lokationItems.map((item, index) => {
            return (
              <ListItem key={index} onClick={item.onClick} sx={{borderRadius: '9999px'}}>
                <ListItemButton sx={{borderRadius: '9999px'}} color={item.color}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
          <Divider />
          <ListItem key={123} sx={{borderRadius: '9999px'}}>
            <ListItemText primary="Tidsserie  " />
          </ListItem>

          {tidsserieItems.map((item, index) => {
            return (
              <ListItem key={index} onClick={item.onClick} sx={{borderRadius: '9999px'}}>
                <ListItemButton sx={{borderRadius: '9999px'}} color={item.color}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
          <Divider />
          <ListItem key={123} sx={{borderRadius: '9999px'}}>
            <ListItemText primary="Udstyr" />
          </ListItem>

          {udstyrItems.map((item, index) => {
            return (
              <ListItem key={index} onClick={item.onClick} sx={{borderRadius: '9999px'}}>
                <ListItemButton sx={{borderRadius: '9999px'}} color={item.color}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default StationDrawer;
