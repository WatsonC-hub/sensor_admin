import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function TrelloModal({open, setOpen, onSchedule}) {
  const [description, setDescription] = React.useState('');
  const handleClose = (e) => {
    setDescription('');
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(description);
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Trello</DialogTitle>
        <DialogContent sx={{maxWidth: '300px'}}>
          <DialogContentText>Ekstra beskrivelse til Trello</DialogContentText>
          <TextField
            autoFocus
            multiline
            margin="dense"
            id="description"
            label="Beskrivelse"
            type="text"
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fortryd</Button>
          <Button onClick={handleSubmit}>Lav kort</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
