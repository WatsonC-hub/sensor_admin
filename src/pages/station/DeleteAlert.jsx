import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import MuiAlert from '@mui/material/Alert';
import Snackbar from "@mui/material/Snackbar";

export default function DeleteAlert({
  measurementId,
  dialogOpen,
  onOkDelete,
  setDialogOpen,
  title,
}) {
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleOk = () => {
    onOkDelete(measurementId);
    setDialogOpen(false);
    setSeverity("success");
    setTimeout(() => {
      handleClickOpen();
    }, 500);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleCloseSnack = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };

  const handleClickOpen = () => {
    setOpenAlert(true);
  };

  return (
    <div>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title ? title : "Vil du slette den række?"}
        </DialogTitle>

        <DialogActions>
          <Button onClick={handleOk} color="primary">
            Ja
          </Button>
          <Button autoFocus onClick={handleClose} color="primary">
            Nej
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openAlert}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleCloseSnack} severity={severity}>
          {severity === "success"
            ? "Sletningen lykkedes"
            : "Sletningen fejlede"}
        </Alert>
      </Snackbar>
    </div>
  );
}
