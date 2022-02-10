import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";

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
          <Button onClick={handleOk} color="primary" autoFocus>
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
