import {DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import React from 'react';
import Button from './Button';

interface AlertProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  closeTitle?: string;
  saveTitle?: string;
  message: string;
  handleOpret: () => void;
}

export default function AlertDialog({
  open,
  setOpen,
  title,
  closeTitle,
  saveTitle,
  message,
  handleOpret,
}: AlertProps) {
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
          <DialogContentText id="alert-dialog-description" sx={{whiteSpace: 'pre-line'}}>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button bttype="tertiary" onClick={handleClose}>
            {closeTitle ?? 'Annuller'}
          </Button>
          <Button bttype="primary" onClick={handleContinue}>
            {saveTitle ?? 'Fortsæt'}
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
