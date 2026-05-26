import {Typography} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

import Button from '~/components/Button';

type DeleteAlertProps = {
  measurementId?: number | string;
  dialogOpen: boolean;
  onOkDelete: (measurementId: number | string | undefined) => void;
  setDialogOpen: (dialogOpen: boolean) => void;
  title?: string;
  onCancel?: () => void;
  loading?: boolean;
};

export default function DeleteAlert({
  measurementId,
  dialogOpen,
  onOkDelete,
  setDialogOpen,
  title,
  onCancel,
  loading,
}: DeleteAlertProps) {
  const handleClose = () => {
    if (onCancel) onCancel();
    setDialogOpen(false);
  };

  const handleOk = () => {
    onOkDelete(measurementId);
  };

  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title ? title : 'Vil du slette rækken?'}</DialogTitle>

        <DialogActions>
          <Button onClick={handleClose} bttype="tertiary">
            <Typography>Nej</Typography>
          </Button>
          <Button onClick={handleOk} loading={loading} bttype="primary">
            <Typography>Ja</Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
