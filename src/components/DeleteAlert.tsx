import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

type DeleteAlertProps = {
  measurementId?: number;
  dialogOpen: boolean;
  onOkDelete: (measurementId: number | undefined) => void;
  setDialogOpen: (dialogOpen: boolean) => void;
  title?: string;
};

export default function DeleteAlert({
  measurementId,
  dialogOpen,
  onOkDelete,
  setDialogOpen,
  title,
}: DeleteAlertProps) {
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
        <DialogTitle id="alert-dialog-title">{title ? title : 'Vil du slette rækken?'}</DialogTitle>

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
