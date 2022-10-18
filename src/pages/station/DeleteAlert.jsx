import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { toast } from "react-toastify";

export default function DeleteAlert({
  measurementId,
  dialogOpen,
  onOkDelete,
  setDialogOpen,
  title,
}) {
  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleOk = () => {
    onOkDelete(measurementId);
    setDialogOpen(false);
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
    </div>
  );
}
