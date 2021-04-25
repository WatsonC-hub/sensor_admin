import React, { useState } from "react";
import { makeStyles, withStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import clsx from "clsx";
import { AddCircle, EditRounded, PhotoCameraRounded } from "@material-ui/icons";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: "#ffa137",
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
}));

const IconButtonWithText = withStyles({
  color: "#ffa137",
  label: {
    flexDirection: "column",
  },
})(Button);

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.getContrastText("#ffa137"),
    backgroundColor: "#ffa137",
    "&:hover": {
      backgroundColor: "#ffa137",
    },
  },
}))(Button);

export default function ActionArea({
  open,
  formToShow,
  setFormToShow,
  canEdit,
}) {
  const classes = useStyles();
  const [openDialog, setOpenDialog] = useState(false);

  // return (
  //   <>
  //     <AppBar
  //       position='fixed'
  //       color='inherit'
  //       className={clsx(classes.appBar1, {
  //         [classes.appBarShift]: open,
  //       })}
  //     >
  //       <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
  //         <ColorButton
  //           onClick={(e) => {
  //             setShowForm(true);
  //           }}
  //         >
  //           <AddCircle />
  //           Indberet pejling
  //         </ColorButton>
  //         <ColorButton>
  //           <EditRounded />
  //           Ret stamdata
  //         </ColorButton>
  //         <ColorButton>
  //           <PhotoCameraRounded />
  //           Tag billede
  //         </ColorButton>
  //       </Toolbar>
  //     </AppBar>
  //   </>
  // );
  return (
    <BottomNav
      formToShow={formToShow}
      setFormToShow={setFormToShow}
      canEdit={canEdit}
    />
  );
}

function BottomNav({ open, formToShow, setFormToShow, canEdit }) {
  const [value, setValue] = useState(-1);
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <BottomNavigation
      className={classes.root}
      value={value}
      onChange={(event, newValue) => {
        //setValue(newValue);
        if (newValue === 0) {
          setFormToShow("ADDPEJLING");
          setTimeout(() => {
            window.scrollTo({ top: matches ? 300 : 500, behavior: "smooth" });
          }, 200);
        }
        if (newValue === 1) {
          setFormToShow("RET_STAMDATA");
        }

        if (newValue === 2) {
          setFormToShow("TAG_BILLEDE");
        }
      }}
      showLabels
    >
      <BottomNavigationAction
        disabled={!canEdit}
        label='Indberet pejling'
        icon={<AddCircle />}
      />
      <BottomNavigationAction
        disabled={!canEdit}
        label='Ret stamdata'
        icon={<EditRounded />}
      />
      <BottomNavigationAction
        disabled={!canEdit}
        label='Tag billede'
        icon={<PhotoCameraRounded />}
      />
    </BottomNavigation>
  );
}
