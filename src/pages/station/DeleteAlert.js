import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import MuiAlert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

export default function DeleteAlert({
  measurementId,
  dialogOpen,
  onOkDelete,
  setDialogOpen,
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
          {"Vil du slette den række?"}
        </DialogTitle>

        <DialogActions>
          <Button onClick={handleOk} color="primary" autoFocus>
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
