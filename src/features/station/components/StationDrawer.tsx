import {ConstructionRounded} from '@mui/icons-material';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import {
  Drawer,
  Toolbar,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {startCase} from 'lodash';
import React, {useContext} from 'react';

import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useStationPages';
import {MetadataContext} from '~/state/contexts';

type Props = object;
const drawerWidth = 240;

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};
const StationDrawer = (props: Props) => {
  const metadata = useContext(MetadataContext);
  console.log('StationDrawer.tsx: StationDrawer: props:', props);
  const [pageToShow, setPageToShow] = useStationPages();
  const {adminKvalitetssikring} = useNavigationFunctions();

  const navigationItems = [
    {
      text: 'Station',
      onClick: () => setPageToShow(null),
      icon: <InboxIcon />,
      color: navIconStyle(pageToShow === 'pejling'),
    },
    {
      text: startCase(stationPages.STAMDATA),
      onClick: () => setPageToShow(stationPages.STAMDATA),
      icon: <ConstructionRounded />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
    {
      text: 'QA',
      onClick: () => adminKvalitetssikring(metadata?.ts_id),
      icon: <AutoGraphIcon />,
      color: navIconStyle(pageToShow === 'stamdata'),
    },
    {
      type: 'divider',
    },
  ];
  const {isMobile} = useBreakpoints();
  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {width: drawerWidth, boxSizing: 'border-box'},
      }}
    >
      <Toolbar />
      <Box sx={{overflow: 'auto'}}>
        <List>
          {navigationItems.map((item, index) => {
            if (item.type === 'divider') {
              return <Divider key={index} />;
            }
            return (
              <ListItem
                key={index}
                button
                onClick={item.onClick}
                sx={{backgroundColor: item.color, borderRadius: '9999px'}}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default StationDrawer;
