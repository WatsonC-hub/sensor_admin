import {DialogActions, Dialog, DialogContent, DialogContentText, DialogTitle} from '@mui/material';
import React from 'react';
import Button from './Button';

interface AlertProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  message: string;
  handleOpret: (required_service?: boolean) => void;
  step?: number;
}

export default function AlertDialog({
  open,
  setOpen,
  title,
  message,
  handleOpret,
  step,
}: AlertProps) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleContinue = (required_service?: boolean) => {
    setOpen(false);
    handleOpret(required_service);
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
          {step === 1 ? (
            <>
              <Button bttype="tertiary" onClick={() => handleContinue(false)}>
                Nej
              </Button>
              <Button bttype="primary" onClick={() => handleContinue(true)}>
                Ja
              </Button>
            </>
          ) : (
            <Button bttype="primary" onClick={() => handleContinue()}>
              Fortsæt
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
