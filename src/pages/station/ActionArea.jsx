import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  AddCircle,
  EditRounded,
  Straighten,
  PlaylistAddCheck,
  PhotoCameraRounded,
} from "@mui/icons-material";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/MoreVert";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";

const bottomNavStyle = {
  borderRadius: 5,
  margin: "7px",
  boxShadow: "3px 3px 3px grey",
  backgroundColor: "secondary.main",
};

const borderGrey = {
  ...bottomNavStyle,
  backgroundColor: "#9E9E9E",
};

const ITEM_HEIGHT = 48;

function DesktopBottomNav({
  setFormToShow,
  canEdit,
  isCalculated,
  isWaterlevel,
}) {
  return (
    <BottomNavigation
      value={-1}
      showLabels
      sx={{
        backgroundColor: "primary.main",
        width: "auto",
        height: "auto",
        margin: "5px",
        boxShadow: "0 3px 5px 2px rgba(115,115,115,255)",
        position: "sticky",
        bottom: "0",
        zIndex: 1,
      }}
    >
      <BottomNavigationAction
        sx={bottomNavStyle}
        // className={classes.border}
        disabled={!canEdit}
        label="Indberet kontrol"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow("ADDPEJLING");
        }}
      />
      {!isCalculated && (
        <BottomNavigationAction
          sx={bottomNavStyle}
          disabled={!canEdit}
          label="Indberet tilsyn"
          icon={<PlaylistAddCheck />}
          onClick={() => {
            setFormToShow("ADDTILSYN");
          }}
        />
      )}
      <BottomNavigationAction
        sx={bottomNavStyle}
        disabled={!canEdit}
        label="Billeder"
        icon={<PhotoCameraRoundedIcon />}
        onClick={() => {
          setFormToShow("CAMERA");
        }}
      />
      {isWaterlevel && (
        <BottomNavigationAction
          sx={bottomNavStyle}
          disabled={!canEdit}
          label="Indberet målepunkt"
          onClick={() => {
            setFormToShow("ADDMAALEPUNKT");
          }}
          icon={<Straighten />}
        />
      )}

      {!isCalculated && (
        <BottomNavigationAction
          sx={bottomNavStyle}
          disabled={!canEdit}
          label="Ændre udstyr"
          icon={<EditRounded />}
          onClick={() => {
            setFormToShow("RET_STAMDATA");
          }}
        />
      )}
    </BottomNavigation>
  );
}

function MobileBottomNav({
  setFormToShow,
  canEdit,
  isCalculated,
  isWaterlevel,
}) {
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
        backgroundColor: "primary.main",
        height: "auto",
        margin: "5px",
        boxShadow: "0 3px 5px 2px rgba(115,115,115,255)",
        position: "sticky",
        bottom: "0",
        zIndex: 1,
      }}
    >
      <BottomNavigationAction
        sx={bottomNavStyle}
        disabled={!canEdit}
        label="Indberet kontrol"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow("ADDPEJLING");
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
            setFormToShow("ADDTILSYN");
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
          setFormToShow("CAMERA");
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
                backgroundColor: "primary.main",
              },
            }}
          >
            {isWaterlevel && (
              <MenuItem>
                <BottomNavigationAction
                  disabled={!canEdit}
                  showLabel
                  sx={borderGrey}
                  label="Indberet målepunkt"
                  onClick={() => {
                    setFormToShow("ADDMAALEPUNKT");
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
                    setFormToShow("RET_STAMDATA");
                    handleClose();
                  }}
                />
              </MenuItem>
            )}
          </Menu>
        </div>
      )}
    </BottomNavigation>
  );
}

export default function ActionArea({
  formToShow,
  setFormToShow,
  canEdit,
  isWaterlevel,
  isCalculated,
}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  return matches ? (
    <MobileBottomNav
      formToShow={formToShow}
      setFormToShow={setFormToShow}
      canEdit={canEdit}
      isWaterlevel={isWaterlevel}
      isCalculated={isCalculated}
    />
  ) : (
    <DesktopBottomNav
      formToShow={formToShow}
      setFormToShow={setFormToShow}
      canEdit={canEdit}
      isWaterlevel={isWaterlevel}
      isCalculated={isCalculated}
    />
  );
}
