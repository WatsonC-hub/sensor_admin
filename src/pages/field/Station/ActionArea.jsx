import {AddAPhotoRounded, AddCircle, ConstructionRounded, EditRounded, PhotoLibraryRounded, PlaylistAddCheck, PlaylistAddRounded, Straighten, StraightenRounded} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/MoreVert';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CustomBottomNavigation from '../../../components/BottomNavigation'


const bottomNavStyle = {
  borderRadius: 10,
  color: 'white',
  '& .Mui-selected': {
    color: 'secondary.main',
  },
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  }
};

const borderGrey = {
  ...bottomNavStyle,
  color: 'white',
};

const navIconStyle = (isSelected) => {
  return isSelected ? 'secondary.main' : 'inherit'
}

const ITEM_HEIGHT = 48;

function DesktopBottomNav({setFormToShow, canEdit, isCalculated, isWaterlevel}) {
  let navigate = useNavigate();
  const [value, setValue] = useState('ADDPEJLING')
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      {/* <Fab color="primary" aria-label="add" onClick={handleClick} style={{ position: 'fixed', bottom: 20, right: 20 }}>
        <AddIcon />
      </Fab> */}
      <BottomNavigation
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          setFormToShow(newValue);
        }}
        showLabels
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
        }}
      >
        <BottomNavigationAction
          sx={bottomNavStyle}
          disabled={!canEdit}
          label="Indberet kontrol"
          icon={<AddCircle sx={navIconStyle(value === 'ADDPEJLING')} />}
          value="ADDPEJLING"
        />
        {!isCalculated && (
          <BottomNavigationAction
            sx={borderGrey}
            disabled={!canEdit}
            label="Indberet tilsyn"
            icon={<PlaylistAddCheck sx={navIconStyle(value === 'ADDTILSYN')} />}
            value="ADDTILSYN"
          />
        )}
        <BottomNavigationAction
          sx={borderGrey}
          disabled={!canEdit}
          label="Billeder"
          icon={<PhotoCameraRoundedIcon sx={navIconStyle(value === 'CAMERA')} />}
          value="CAMERA"
        />
        {isWaterlevel && (
          <BottomNavigationAction
            sx={borderGrey}
            disabled={!canEdit}
            label="Målepunkter"
            icon={<Straighten sx={navIconStyle(value === 'ADDMAALEPUNKT')} />}
            value="ADDMAALEPUNKT"
          />
        )}

        {!isCalculated && (
          <BottomNavigationAction
            sx={borderGrey}
            disabled={!canEdit}
            label="Ændre udstyr"
            icon={<EditRounded sx={navIconStyle(value === 'RET_STAMDATA')} />}
            value="RET_STAMDATA"
          />
        )}
      </BottomNavigation>
    </Paper>
  );
}

function MobileBottomNav({setFormToShow, canEdit, isCalculated, isWaterlevel}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  let navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation
        value={-1}
        showLabels
        sx={{
          backgroundColor: 'primary.main',
          height: 'auto',
          width: 'auto',
          // boxShadow: '0 3px 5px 2px rgba(115,115,115,255)',
          position: 'sticky',
          bottom: '0',
          zIndex: 1,
        }}
      >
        <BottomNavigationAction
          sx={bottomNavStyle}
          disabled={!canEdit}
          label="Indberet kontrol"
          icon={<AddCircle />}
          onClick={() => {
            setFormToShow('ADDPEJLING');
            handleClose();
          }}
        />
        {!isCalculated && (
          <BottomNavigationAction
            sx={borderGrey}
            disabled={!canEdit}
            label="Indberet tilsyn"
            icon={<PlaylistAddCheck />}
            onClick={() => {
              setFormToShow('ADDTILSYN');
              handleClose();
            }}
          />
        )}

        <BottomNavigationAction
          sx={borderGrey}
          disabled={!canEdit}
          label="Billeder"
          icon={<PhotoCameraRoundedIcon />}
          onClick={() => {
            setFormToShow('CAMERA');
            handleClose();
          }}
        />

        {(isWaterlevel || !isCalculated) && (
          <div>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleClick}
              size="medium"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="long-menu"
              anchorEl={anchorEl}
              keepMounted
              open={open}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              {isWaterlevel && (
                <MenuItem>
                  <BottomNavigationAction
                    disabled={!canEdit}
                    showLabel
                    sx={borderGrey}
                    label="Målepunkter"
                    onClick={() => {
                      setFormToShow('ADDMAALEPUNKT');
                      handleClose();
                    }}
                    icon={<Straighten />}
                  />
                </MenuItem>
              )}
              {!isCalculated && (
                <MenuItem>
                  <BottomNavigationAction
                    sx={borderGrey}
                    showLabel
                    disabled={!canEdit}
                    label="Ændre udstyr"
                    icon={<EditRounded />}
                    onClick={() => {
                      setFormToShow('RET_STAMDATA');
                      handleClose();
                    }}
                  />
                </MenuItem>
              )}
            </Menu>
          </div>
        )}
      </BottomNavigation>
    </Paper>
  );
}



export default function ActionArea({
  setShowData,
  formToShow,
  setFormToShow,
  canEdit,
  isWaterlevel,
  isCalculated,
  fileInputRef
}) {
  const theme = useTheme();
  const [value, setValue] = useState('ADDPEJLING')
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setShowData(newValue);
    if(formToShow !== null){
      setFormToShow('')
    }
  }

  const pejlingItem = { fabText: 'Tilføj pejling', fabIcon: <AddCircle /> }
  const tilsynItem = { fabText: 'Registrer tilsyn', fabIcon: <PlaylistAddRounded /> }
  const billedeItem = { fabText: 'Tilføj billede', fabIcon: <AddAPhotoRounded /> }
  const målepunktItem = { fabText: 'Tilføj målepunkt', fabIcon: <StraightenRounded /> }

  const navigationItems = [
    { text: 'pejling', value:'ADDPEJLING',  icon: <AddCircle />, color: navIconStyle(value === 'ADDPEJLING'), fabItem: pejlingItem, },
    { text: 'tilsyn', value:'ADDTILSYN',  icon: <PlaylistAddCheck />, color: navIconStyle(value === 'ADDTILSYN'), isCalculated:isCalculated, fabItem: tilsynItem },
    { text: 'Billeder', value:'CAMERA',  icon: <PhotoLibraryRounded />, color: navIconStyle(value === 'CAMERA'), fabItem: billedeItem },
    { text: 'Målepunkter', value:'ADDMAALEPUNKT',  icon: <StraightenRounded />, color: navIconStyle(value === 'ADDMAALEPUNKT'), isCalculated: isCalculated, isWaterLevel:isWaterlevel, fabItem: målepunktItem },
    { text: 'udstyr', value:'RET_STAMDATA',  icon: <ConstructionRounded />, color: navIconStyle(value === 'RET_STAMDATA'), fabText: 'udstyr', isCalculated:isCalculated }
  ];

  return <CustomBottomNavigation showData={value} setFormToShow={setFormToShow} setShowData={setShowData} onChange={handleChange} items={navigationItems} canEdit={canEdit} fileInputRef={fileInputRef} />

  // return matches ? (
  //   <MobileBottomNav
  //     formToShow={formToShow}
  //     setFormToShow={setFormToShow}
  //     canEdit={canEdit}
  //     isWaterlevel={isWaterlevel}
  //     isCalculated={isCalculated}
  //   />
  // ) : (
  //   <DesktopBottomNav
  //     formToShow={formToShow}
  //     setFormToShow={setFormToShow}
  //     canEdit={canEdit}
  //     isWaterlevel={isWaterlevel}
  //     isCalculated={isCalculated}
  //   />
  // );
}
