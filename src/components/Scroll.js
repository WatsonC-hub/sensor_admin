import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Fab from "@material-ui/core/Fab";

const useStyles = makeStyles((theme) => ({
  toTop: {
    zIndex: 2,
    position: "fixed",
    bottom: "2vh",
    backgroundColor: "lightseagreen",
    color: "black",
    "&:hover, &.Mui-focusVisible": {
      transition: "0.3s",
      color: "#397BA6",
      backgroundColor: "lightseagreen",
    },
  },
  "&:.MuiFab-root:hover, .MuiFab-root:active": {
    backgroundColor: "lightseagreen",
  },
  "&:.MuiTouchRipple-root": {
    backgroundColor: "lightseagreen",
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1000,
    backgroundColor: "lightseagreen",
  },
}));

export default function Scroll({ showBelow }) {
  const [show, setShow] = useState(showBelow ? false : true);
  const classes = useStyles();
  const handleScroll = () => {
    if (window.pageYOffset > showBelow) {
      if (!show) setShow(true);
    } else {
      if (show) setShow(false);
    }
  };

  useEffect(() => {
    if (showBelow) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    show && (
      <Fab size='small' className={classes.fab} onClick={handleClick}>
        <ExpandLessIcon />
      </Fab>
    )
  );
}
//}

//(
// <div className={classes.toTop}>
//   {show && (

//   )}
// </div>
//);
