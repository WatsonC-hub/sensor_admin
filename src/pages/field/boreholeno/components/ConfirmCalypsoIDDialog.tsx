import {Typography} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';

interface DialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm: () => void;
  calypso_id?: number | null;
}

export default function ConfirmCalypsoIDDialog({
  open,
  setOpen,
  onConfirm,
  calypso_id,
}: DialogProps) {
  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onConfirm();
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Bekræft Calypso ID</DialogTitle>
        <DialogContent sx={{width: '300px'}}>
          <Typography gutterBottom variant="body1">
            Calypso ID: {calypso_id}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fortryd</Button>
          <Button onClick={(e) => handleSubmit(e)}>Bekræft</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
