import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  SvgIconProps,
  Box,
  useMediaQuery,
  MenuItem,
  Menu,
  IconButton,
} from '@mui/material';
import CustomBottomNavigationActionLabel from './CustomLabel';
import {useTheme} from '@mui/material/styles';
import React from 'react';
import MenuIcon from '@mui/icons-material/MoreVert';

interface NavigationItem {
  text: string;
  value: string;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
  isCalculated: boolean;
}

interface CustomBottomNavigationProps {
  showData: string;
  onChange: (event: React.ChangeEvent<{}>, newValue: string) => void;
  items: NavigationItem[];
  canEdit?: boolean;
}

const bottomNavStyle = {
  borderRadius: 10,
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
};

const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
  showData,
  onChange,
  items,
  canEdit,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const threshold = isMobile ? 4 : items.length;
  const visibleItems = items.slice(0, threshold);
  const hiddenItems = items.slice(threshold);

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, value: string) => {
    onChange(event, value);
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{mt: 17}}>
      {isMobile && hiddenItems.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          PaperProps={{
            sx: {
              backgroundColor: 'primary.main',
              color: 'white',
            },
          }}
        >
          {hiddenItems.map((item) => {
            if (
              item.isCalculated !== undefined &&
              item.isCalculated !== false &&
              (item.value === 'ADDTILSYN' || item.value === 'RET_STAMDATA')
            )
              return;
            return (
              <MenuItem
                key={item.value}
                onClick={(event) => handleMenuItemClick(event, item.value)}
              >
                <BottomNavigationAction
                  showLabel
                  disabled={!canEdit}
                  label={<CustomBottomNavigationActionLabel {...item} />}
                  value={item.value}
                  onClick={() => {
                    onChange;
                  }}
                  sx={bottomNavStyle}
                />
              </MenuItem>
            );
          })}
        </Menu>
      )}
      <Paper sx={{position: 'fixed', bottom: 0, left: 0, right: 0}} elevation={3}>
        <BottomNavigation
          value={showData}
          showLabels
          onChange={(event, newValue) => {
            onChange(event, newValue);
          }}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          {visibleItems.map((item) => {
            if (
              item.isCalculated !== undefined &&
              item.isCalculated !== false &&
              (item.value === 'ADDTILSYN' || item.value === 'RET_STAMDATA')
            ) {
              return;
            }

            return (
              <BottomNavigationAction
                key={item.value}
                label={<CustomBottomNavigationActionLabel {...item} />}
                value={item.value}
                sx={bottomNavStyle}
              />
            );
          })}
          {isMobile && hiddenItems.length > 0 && (
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              size="medium"
            >
              <MenuIcon />
            </IconButton>
          )}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default CustomBottomNavigation;
