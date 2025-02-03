import {BottomNavigation, BottomNavigationAction, Paper, SvgIconProps, Box} from '@mui/material';
import React from 'react';

import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';

import CustomBottomNavigationActionLabel from './CustomLabel';

interface NavigationItem<T> {
  text: string;
  value: T;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
  isCalculated?: boolean;
  handlePrefetch?: () => void;
}

interface CustomBottomNavigationProps<T> {
  pageToShow: T;
  onChange: (event: React.ChangeEvent<object>, newValue: T) => void;
  items: Array<NavigationItem<T>>;
  canEdit?: boolean;
}

const bottomNavStyle = {
  borderRadius: 10,
  color: 'white',
  transition: 'none',
  animation: 'none',
};

const CustomBottomNavigation = <T extends string>({
  pageToShow,
  onChange,
  items,
}: CustomBottomNavigationProps<T>): React.ReactElement => {
  const {isMobile} = useBreakpoints();
  const threshold = isMobile ? 4 : items.length;
  const visibleItems = items.slice(0, threshold);

  return (
    <Box sx={{mt: isMobile ? 15 : 8, zIndex: (theme) => theme.zIndex.drawer + 2}}>
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
