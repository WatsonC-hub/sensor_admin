import {Typography} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

export default function ConfirmCalypsoIDDialog({open, setOpen, onConfirm, calypso_id}) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Bekræft Calypso ID</DialogTitle>
        <DialogContent sx={{width: '300px'}}>
          <Typography gutterBottom variant="body">
            Calypso ID: {calypso_id}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fortryd</Button>
          <Button onClick={handleSubmit}>Bekræft</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
