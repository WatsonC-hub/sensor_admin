import {DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import React from 'react';
import Button from './Button';

interface AlertProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  message: string;
  handleOpret: () => void;
}

export default function AlertDialog({open, setOpen, title, message, handleOpret}: AlertProps) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleContinue = () => {
    setOpen(false);
    handleOpret();
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={handleClose}>
            Annuller
          </Button>
          <Button bttype="primary" onClick={handleContinue}>
            Fortsæt
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
