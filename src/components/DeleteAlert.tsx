import {Typography} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

import Button from './Button';

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
          <Button autoFocus onClick={handleClose} bttype="tertiary">
            <Typography>Nej</Typography>
          </Button>
          <Button onClick={handleOk} bttype="primary">
            <Typography>Ja</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
