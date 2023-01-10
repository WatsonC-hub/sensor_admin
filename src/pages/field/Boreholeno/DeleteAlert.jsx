import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';

export default function DeleteAlert({measurementId, dialogOpen, onOkDelete, setDialogOpen}) {
  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleOk = () => {
    let statuscode = onOkDelete(measurementId);
    console.log(statuscode);
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
        <DialogTitle id="alert-dialog-title">{'Vil du slette den række?'}</DialogTitle>

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
