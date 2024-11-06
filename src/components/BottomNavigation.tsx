import {BottomNavigation, BottomNavigationAction, Paper, SvgIconProps, Box} from '@mui/material';
import React from 'react';

import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';

import CustomBottomNavigationActionLabel from './CustomLabel';

interface NavigationItem {
  text: string;
  value: string | null;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
  isCalculated?: boolean;
  handlePrefetch?: () => void;
}

interface CustomBottomNavigationProps {
  pageToShow: string | null;
  onChange: (event: React.ChangeEvent<object>, newValue: string | null) => void;
  items: Array<NavigationItem>;
  canEdit?: boolean;
}

const bottomNavStyle = {
  borderRadius: 10,
  color: 'white',
  transition: 'none',
  animation: 'none',
};

const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
  pageToShow,
  onChange,
  items,
}) => {
  const {isMobile} = useBreakpoints();
  const threshold = isMobile ? 4 : items.length;
  const visibleItems = items.slice(0, threshold);

  return (
    <Box sx={{mt: isMobile ? 15 : 8, zIndex: 3}}>
      <Paper sx={{position: 'fixed', bottom: 0, width: '100%'}} elevation={3}>
        <BottomNavigation
          value={pageToShow}
          showLabels
          onChange={(event, newValue) => {
            onChange(event, newValue);
          }}
          sx={{
            backgroundColor: 'primary.main',
          }}
        >
          {visibleItems.map((item) => {
            if (
              item.isCalculated !== undefined &&
              item.isCalculated &&
              item.value === stationPages.TILSYN
            ) {
              return;
            }

            return (
              <BottomNavigationAction
                key={item.value}
                label={<CustomBottomNavigationActionLabel {...item} />}
                value={item.value}
                sx={bottomNavStyle}
                onFocus={item.handlePrefetch}
                onMouseEnter={item.handlePrefetch}
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default CustomBottomNavigation;
