import {BottomNavigation, BottomNavigationAction, Box, SvgIconProps} from '@mui/material';
import React from 'react';

import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';

import CustomBottomNavigationActionLabel from './CustomLabel';

interface NavigationItem<T> {
  text: string;
  value: T;
  icon: React.ReactElement<SvgIconProps>;
  color: string;
  display?: boolean;
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
    // <Box sx={{mt: isMobile ? 15 : 8, zIndex: (theme) => theme.zIndex.drawer + 8}}>
    <Box
      sx={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'primary.main',
      }}
    >
      <BottomNavigation
        value={pageToShow}
        showLabels
        onChange={(event, newValue) => {
          onChange(event, newValue);
        }}
        sx={{
          // zIndex: 3,
          // position: 'absolute',
          width: '100%',
          // bottom: 0,
          // height: 'fit-content',
          backgroundColor: 'primary.main',
        }}
      >
        {visibleItems
          .filter((item) => item.display || item.display === undefined)
          .map((item) => {
            if (
              item.isCalculated !== undefined &&
              item.isCalculated &&
              (item.value === stationPages.TILSYN || item.value === stationPages.MAALEPUNKT)
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
    </Box>
    // </Box>
  );
};

export default CustomBottomNavigation;
