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
  loading?: boolean;
}

export default function AlertDialog({
  
  open,
 
  setOpen,
 
  title,
  closeTitle,
  saveTitle,
 
  message,
 
  handleOpret,
,
  loading,
}: AlertProps) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleContinue = () => {
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
          <Button bttype="tertiary" bttype="tertiary" onClick={handleClose}>
            {closeTitle ?? 'Annuller'}
          
          </Button>
          <Button bttype="primary" bttype="primary" onClick={handleContinue} loading={loading}>
            
            {saveTitle ?? 'Fortsæt'}
          
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
