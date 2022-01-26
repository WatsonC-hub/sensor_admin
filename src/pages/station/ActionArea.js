import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {
  AddCircle,
  EditRounded,
  Straighten,
  PlaylistAddCheck,
} from "@material-ui/icons";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.secondary.main,
    height: "auto",
    margin: "5px",
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
}));

export default function ActionArea({ formToShow, setFormToShow, canEdit }) {
  return (
    <BottomNav
      formToShow={formToShow}
      setFormToShow={setFormToShow}
      canEdit={canEdit}
    />
  );
}

function BottomNav({ setFormToShow, canEdit }) {
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <BottomNavigation
      className={classes.root}
      value={-1}
      onChange={(event, newValue) => {
        if (newValue === 0) {
          setFormToShow("ADDPEJLING");
          setTimeout(() => {
            window.scrollTo({ top: matches ? 300 : 500, behavior: "smooth" });
          }, 200);
        }
        if (newValue === 3) {
          setFormToShow("RET_STAMDATA");
        }

        if (newValue === 2) {
          setFormToShow("ADDTILSYN");
        }

        if (newValue === 1) {
          setFormToShow("ADDMAALEPUNKT");
        }
      }}
      showLabels
    >
      <BottomNavigationAction
        disabled={!canEdit}
        label="Indberet pejling"
        icon={<AddCircle />}
      />
      <BottomNavigationAction
        disabled={!canEdit}
        label="Indberet målepunkt"
        icon={<Straighten className={classes.icon} />}
      />
      <BottomNavigationAction
        disabled={!canEdit}
        label="Indberet tilsyn"
        icon={<PlaylistAddCheck />}
      />
      <BottomNavigationAction
        disabled={!canEdit}
        label="Ret stamdata"
        icon={<EditRounded />}
      />
      {/* <BottomNavigationAction
        disabled={!canEdit}
        label='Tag billede'
        icon={<PhotoCameraRounded />}
      /> */}
    </BottomNavigation>
  );
}
