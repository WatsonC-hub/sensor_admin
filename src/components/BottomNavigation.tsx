import React, { useEffect, useRef, useState } from 'react';

import { BottomNavigation, BottomNavigationAction, IconButton, Menu, MenuItem, Paper, useMediaQuery, Fab, SvgIconProps, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/MoreVert';
import {useTheme} from '@mui/material/styles';
import CustomBottomNavigationActionLabel from './CustomLabel';
import moment from 'moment';
import SaveImageDialog from './SaveImageDialog';
import { Typography } from '@mui/material';

interface FabItem {
  fabText: string;
  fabIcon: React.ReactElement<SvgIconProps>;
}

interface NavigationItem {
    text: string;
    value: string;
    icon: React.ReactElement<SvgIconProps>;
    color: string;
    fabText: string;
    isCalculated: boolean;
    isWaterLevel: boolean;
    fabItem: FabItem
  }

interface CustomBottomNavigationProps {
    showData: string;
    setFormToShow: React.Dispatch<React.SetStateAction<string>>;
    setShowData: React.Dispatch<React.SetStateAction<string>>;
    onChange: (event: React.ChangeEvent<{}>, newValue: string) => void;
    items: NavigationItem[];
    canEdit?: boolean;
    id: string;
    type: string;
    fileInputRef: any
}

const bottomNavStyle = {
    borderRadius: 10,
    color: 'white',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
  };

  const fabTextStyle = {
    padding: 1,
    textTransform: 'initial'
  }

const CustomBottomNavigation: React.FC<CustomBottomNavigationProps> = ({
    showData,
    setFormToShow,
    setShowData,
    onChange,
    items,
    canEdit,
    fileInputRef
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const threshold = isMobile ? 3 : items.length
  const visibleItems = items.slice(0, threshold);
  const hiddenItems = items.slice(threshold);

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, value: string) => {
    onChange(event, value); // Call the callback function with the clicked value
    handleMenuClose(); // Close the menu
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShowForm = () => {
    console.log(fileInputRef.current)
    if(fileInputRef.current && showData === 'CAMERA')
        fileInputRef.current.click();

    setFormToShow(showData)
    // if(showData !== 'CAMERA'){
    // }
    // setShowData('')
  }

  return (
    <Box sx={{ mt: 17 }}>
      {/* {showData === 'CAMERA' &&
        <div>
          <SaveImageDialog
          activeImage={activeImage}
          changeData={changeActiveImageData}
          id={id}
          type={type}
          open={openSave}
          dataUri={dataUri}
          handleCloseSave={() => {
            setOpenSave(false)
            setdataUri('')
          }}/>
          <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileRead}/>
      </div>
      } */}
      { items.find(item => item.value === showData)?.fabItem !== undefined &&
        <Fab color="secondary" aria-label="add" onClick={handleShowForm} sx={{ position: 'fixed', bottom: 65, right: 20, width: 200, height: 60, borderRadius: 4.5, color: 'white' }}>
          <>
              { items.find(item => item.value === showData)?.fabItem.fabIcon }
              <Typography sx={fabTextStyle}>
              { items.find(item => item.value === showData)?.fabItem.fabText }
              </Typography>
          </>
        </Fab>
      }
      
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        {isMobile && hiddenItems.length > 0 && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          PaperProps={{
              sx: {
              backgroundColor: 'primary.main',
              color: 'white'
              },
          }}>
          {hiddenItems.map((item) => {
            if(((item.isWaterLevel !== undefined && item.isWaterLevel === false) && item.value === 'ADDMAALEPUNKT') || ((item.isCalculated !== undefined && item.isCalculated !== false) && (item.value === 'ADDTILSYN' || item.value === 'RET_STAMDATA')))
              return;
            return <MenuItem key={item.value} onClick={(event) => handleMenuItemClick(event, item.value) }>
              <BottomNavigationAction
                  showLabel
                  disabled={!canEdit}
                  label={<CustomBottomNavigationActionLabel {...item} /> }
                  value={item.value}
                  onClick={() => { onChange }}
                  sx={bottomNavStyle}
              />
            </MenuItem>
          })}
        </Menu>
        )}
        <BottomNavigation
          value={showData}
          showLabels
          onChange={(event, newValue) => { onChange(event, newValue) }}
          sx={{
              backgroundColor: 'primary.main',
              color: 'white',
          }}>
          {visibleItems.map((item) => {
            if(((item.isWaterLevel !== undefined && item.isWaterLevel === false) && item.value === 'ADDMAALEPUNKT') || ((item.isCalculated !== undefined && item.isCalculated !== false) && (item.value === 'ADDTILSYN' || item.value === 'RET_STAMDATA'))){
              return;
            }
            
            return <BottomNavigationAction
            key={item.value}
            label={<CustomBottomNavigationActionLabel {...item} />}
            value={item.value}
            sx={bottomNavStyle}
            />
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
}

export default CustomBottomNavigation;