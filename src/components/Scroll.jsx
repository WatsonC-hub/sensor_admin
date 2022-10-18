import React, { useState, useEffect } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Fab from "@mui/material/Fab";

export default function Scroll({ showBelow }) {
  const [show, setShow] = useState(showBelow ? false : true);

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
      <Fab
        size="small"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 1,
          right: 1,
          zIndex: 1000,
          backgroundColor: "lightseagreen",
        }}
      >
        <ExpandLessIcon />
      </Fab>
    )
  );
}
