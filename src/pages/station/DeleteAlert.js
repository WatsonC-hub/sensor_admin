import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

export default function DeleteAlert({
  measurementId,
  dialogOpen,
  onOkDelete,
  setDialogOpen,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>
          {"Vil du slette den række?"}
        </DialogTitle>

        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Nej
          </Button>
          <Button onClick={handleOk} color='primary' autoFocus>
            Ja
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
