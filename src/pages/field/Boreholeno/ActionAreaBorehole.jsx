import {
  AddCircle,
  Construction,
  EditRounded,
  PlaylistAddCheck,
  Straighten,
} from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/MoreVert';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import {IconButton, Menu, MenuItem, useMediaQuery, useTheme} from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import React, {useState} from 'react';
import {stamdataStore} from '../../../state/store';

const bottomNavStyle = {
  borderRadius: 5,
  margin: '7px',
  boxShadow: '3px 3px 3px grey',
  backgroundColor: 'secondary.main',
  width: '100px',
  height: '58px',
};

const borderGrey = {
  ...bottomNavStyle,
  backgroundColor: '#9E9E9E',
};

function MobileBottomNav({setFormToShow, canEdit}) {
  const hasUnit = stamdataStore((state) => !state.isEmpty);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <BottomNavigation
      value={-1}
      showLabels
      sx={{
        backgroundColor: 'primary.main',
        height: 'auto',
        width: 'auto',
        boxShadow: '0 3px 5px 2px rgba(115,115,115,255)',
        position: 'sticky',
        bottom: '0',
        zIndex: 1,
      }}
    >
      <BottomNavigationAction
        sx={bottomNavStyle}
        // disabled={!canEdit}
        label="Indberet pejling"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow('ADDPEJLING');
        }}
      />
      <BottomNavigationAction
        sx={borderGrey}
        // disabled={!canEdit}
        label="Målepunkter"
        onClick={() => {
          setFormToShow('ADDMAALEPUNKT');
        }}
        icon={<Straighten />}
      />

      <BottomNavigationAction
        sx={borderGrey}
        // disabled={!canEdit}
        label="Billeder"
        showLabel={true}
        icon={<PhotoCameraRoundedIcon />}
        onClick={() => {
          setFormToShow('CAMERA');
        }}
      />

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
          <MenuItem>
            <BottomNavigationAction
              sx={borderGrey}
              disabled={!canEdit}
              showLabel
              label="Indberet tilsyn"
              icon={<PlaylistAddCheck />}
              onClick={() => {
                setFormToShow('ADDTILSYN');
              }}
            />
          </MenuItem>

          <MenuItem>
            <BottomNavigationAction
              sx={borderGrey}
              disabled={!canEdit}
              showLabel
              label="Udstyr"
              icon={<Construction />}
              onClick={() => {
                setFormToShow('UDSTYR_STAMDATA');
              }}
            />
          </MenuItem>
          <MenuItem>
            <BottomNavigationAction
              sx={borderGrey}
              disabled={!canEdit}
              showLabel
              label="Stamdata"
              icon={<EditRounded />}
              onClick={() => {
                setFormToShow('STAMDATA');
              }}
            />
          </MenuItem>
        </Menu>
      </div>
    </BottomNavigation>
  );
}

function BottomNav({setFormToShow, canEdit}) {
  const hasUnit = stamdataStore((state) => !state.isEmpty);

  return (
    <BottomNavigation
      sx={{
        backgroundColor: 'primary.main',
        width: 'auto',
        height: 'auto',
        boxShadow: '0 3px 5px 2px rgba(115,115,115,255)',
        position: 'sticky',
        bottom: '0',
        zIndex: 1,
      }}
      value={-1}
      showLabels
    >
      <BottomNavigationAction
        sx={bottomNavStyle}
        // disabled={!canEdit}
        label="Indberet pejling"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow('ADDPEJLING');
        }}
      />
      <BottomNavigationAction
        sx={borderGrey}
        // disabled={!canEdit}
        label="Målepunkter"
        onClick={() => {
          setFormToShow('ADDMAALEPUNKT');
        }}
        icon={<Straighten />}
      />
      {hasUnit && (
        <BottomNavigationAction
          sx={borderGrey}
          disabled={!canEdit}
          showLabel
          label="Indberet tilsyn"
          icon={<PlaylistAddCheck />}
          onClick={() => {
            setFormToShow('ADDTILSYN');
          }}
        />
      )}
      <BottomNavigationAction
        sx={borderGrey}
        // disabled={!canEdit}
        label="Billeder"
        showLabel={true}
        icon={<PhotoCameraRoundedIcon />}
        onClick={() => {
          setFormToShow('CAMERA');
        }}
      />
      {hasUnit && (
        <BottomNavigationAction
          sx={borderGrey}
          disabled={!canEdit}
          label="Udstyr"
          icon={<Construction />}
          onClick={() => {
            setFormToShow('UDSTYR_STAMDATA');
          }}
        />
      )}
      {canEdit && (
        <BottomNavigationAction
          sx={borderGrey}
          // disabled={!canEdit}
          label="Stamdata"
          showLabel={true}
          icon={<EditRounded />}
          onClick={() => {
            setFormToShow('STAMDATA');
          }}
        />
      )}
    </BottomNavigation>
  );
}

export default function ActionArea({formToShow, setFormToShow, canEdit}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const hasUnit = stamdataStore((state) => !state.isEmpty);
  return matches && hasUnit ? (
    <MobileBottomNav formToShow={formToShow} setFormToShow={setFormToShow} canEdit={canEdit} />
  ) : (
    <BottomNav formToShow={formToShow} setFormToShow={setFormToShow} canEdit={canEdit} />
  );
}
