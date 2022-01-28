import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

export default function Alert({ openAlert, setOpenAlert, severity, message }) {
  const handleClose = () => {
    setOpenAlert(false);
  };

  const handleCloseSnack = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  return (
    <Snackbar
      openAlert={openAlert}
      autoHideDuration={4000}
      onClose={handleCloseSnack}
    >
      <Alert onClose={handleClose}>
        {severity === "success" ? message : message}
      </Alert>
    </Snackbar>
  );
}
