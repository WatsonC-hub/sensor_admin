import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  AddCircle,
  EditRounded,
  Straighten,
  PlaylistAddCheck,
  PhotoCameraRounded,
} from "@material-ui/icons";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MenuIcon from "@material-ui/icons/MoreVert";
import PhotoCameraRoundedIcon from "@material-ui/icons/PhotoCameraRounded";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.secondary.main,
    height: "auto",
    margin: "5px",
    boxShadow: "0 3px 5px 2px rgba(115,115,115,255)",
    position: "sticky",
    bottom: "0",
    zIndex: 1,
  },
  appBar: {
    top: "auto",
    bottom: 0,
  },
  appBar1: {
    top: "auto",
    bottom: 0,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - 240px)`,
    marginLeft: 240,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  grow: {
    flexGrow: 1,
  },
  fabButton: {
    position: "absolute",
    zIndex: 1,
    top: -30,
    left: 0,
    right: 0,
    margin: "0 auto",
  },
  icon: {
    transform: "rotate(90deg)",
  },
  border: {
    //border: "2px solid black",
    borderRadius: 3,
    margin: "7px",
    boxShadow: "0 3px 5px 0px rgba(115,115,115,255)",
    backgroundColor: theme.palette.secondary.main,
  },
}));

const ITEM_HEIGHT = 48;

function DesktopBottomNav({ setFormToShow, canEdit }) {
  const classes = useStyles();

  return (
    <BottomNavigation className={classes.root} value={-1} showLabels>
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Indberet pejling"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow("ADDPEJLING");
        }}
      />
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Indberet tilsyn"
        icon={<Straighten className={classes.icon} />}
        onClick={() => {
          setFormToShow("ADDTILSYN");
        }}
      />
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Ændre udstyr"
        icon={<EditRounded />}
        onClick={() => {
          setFormToShow("RET_STAMDATA");
        }}
      />
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Indberet målepunkt"
        onClick={() => {
          setFormToShow("ADDMAALEPUNKT");
        }}
        icon={<Straighten className={classes.icon} />}
      />
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Tag billede"
        icon={<PhotoCameraRoundedIcon />}
        onClick={() => {
          setFormToShow("CAMERA");
        }}
      />
    </BottomNavigation>
  );
}

function MobileBottomNav({ setFormToShow, canEdit }) {
  const classes = useStyles();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <BottomNavigation className={classes.root} value={-1} showLabels>
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Indberet pejling"
        icon={<AddCircle />}
        onClick={() => {
          setFormToShow("ADDPEJLING");
          handleClose();
        }}
      />
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Indberet tilsyn"
        icon={<PlaylistAddCheck />}
        onClick={() => {
          setFormToShow("ADDTILSYN");
          handleClose();
        }}
      />
      <BottomNavigationAction
        className={classes.border}
        disabled={!canEdit}
        label="Ændre udstyr"
        icon={<EditRounded />}
        onClick={() => {
          setFormToShow("RET_STAMDATA");
          handleClose();
        }}
      />
      <IconButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
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
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "auto",
            backgroundColor: theme.palette.secondary.main,
          },
        }}
      >
        <div>
          <MenuItem>
            <BottomNavigationAction
              className={classes.border}
              disabled={!canEdit}
              label="Indberet målepunkt"
              showLabel={true}
              onClick={() => {
                setFormToShow("ADDMAALEPUNKT");
                handleClose();
              }}
              icon={<Straighten className={classes.icon} />}
            />
          </MenuItem>
          <MenuItem>
            <BottomNavigationAction
              className={classes.border}
              disabled={!canEdit}
              label="Tag billede"
              showLabel={true}
              icon={<PhotoCameraRoundedIcon />}
              onClick={() => {
                setFormToShow("CAMERA");
                handleClose();
              }}
            />
          </MenuItem>
        </div>
      </Menu>
    </BottomNavigation>
  );
}

export default function ActionArea({ formToShow, setFormToShow, canEdit }) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  return matches ? (
    <MobileBottomNav
      formToShow={formToShow}
      setFormToShow={setFormToShow}
      canEdit={canEdit}
    />
  ) : (
    <DesktopBottomNav
      formToShow={formToShow}
      setFormToShow={setFormToShow}
      canEdit={canEdit}
    />
  );
}
