import React, {ReactNode} from 'react';
import {fragments} from '../consts';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import FolderIcon from '@mui/icons-material/Folder';
import TimerIcon from '@mui/icons-material/Timer';
import RouterIcon from '@mui/icons-material/Router';
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {useDataFragmentState} from '~/hooks/useQueryStateParameters';

const drawerWidth = 240;

type Item = {
  text: string;
  fragment: keyof typeof fragments;
  icon: React.ReactNode;
  requiredTsId?: boolean;
  disabled?: boolean;
  onHover?: () => void;
};

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

const OverviewDrawer = () => {
  const [fragmentToShow, setFragmentToShow] = useDataFragmentState();
  const items: Item[] = [
    {
      text: 'Projekter',
      fragment: 'projects',
      icon: <FolderIcon />,
    },
    {
      text: 'Grupper',
      fragment: 'groups',
      icon: <WorkspacesIcon />,
    },
    {
      text: 'Alarmer',
      fragment: 'alarms',
      icon: <TimerIcon />,
    },
    {
      text: 'Enheder',
      fragment: 'units',
      icon: <RouterIcon />,
    },
  ];

  const drawerItems = items.map((item) => {
    let timer = 0;

    const mouseEnter = () => {
      timer = setTimeout(item.onHover ? item.onHover : () => {}, 100);
    };

    const mouseLeave = () => {
      clearTimeout(timer);
    };
    return (
      <Box key={item.text}>
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
              color: navIconStyle(fragmentToShow === item.fragment),
              py: 0,
            }}
            onClick={() => {
              setFragmentToShow(item.fragment);
            }}
          >
            <ListItemIcon
              sx={{color: navIconStyle(fragmentToShow === item.fragment), minWidth: 42}}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText>{item.text}</ListItemText>
          </ListItemButton>
        </ListItem>
        {items.indexOf(item) !== items.length - 1 && <Divider />}
      </Box>
    );
  });

  return (
    <Layout variant="permanent">
      <List>{drawerItems}</List>
    </Layout>
  );
};

type LayoutProps = {
  children: ReactNode;
  variant?: 'temporary' | 'permanent';
};

const Layout = ({children, variant}: LayoutProps) => {
  return (
    <Box>
      <Drawer
        variant={variant}
        open={true}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            backgroundColor: 'primary.main',
            pt: '64px',
          },
        }}
      >
        <Box sx={{overflowY: 'auto', overflowX: 'hidden', p: 0}}>{children}</Box>
      </Drawer>
    </Box>
  );
};

export default OverviewDrawer;
