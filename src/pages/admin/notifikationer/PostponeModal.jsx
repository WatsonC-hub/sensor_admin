import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import moment from 'moment';
import * as React from 'react';

export default function PostponeModal({open, setOpen, onPostpone}) {
  const [postponeDate, setPostponeDate] = React.useState(
    moment().add(7, 'days').format('YYYY-MM-DD')
  );
  const handleClose = (e) => {
    setOpen(false);
    setPostponeDate(moment().add(7, 'days').format('YYYY-MM-DD'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPostpone(postponeDate);
    setOpen(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Udskyd</DialogTitle>
        <DialogContent sx={{width: '300px'}}>
          <DialogContentText>Udskyd til</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="date"
            label="Dato"
            type="date"
            fullWidth
            value={postponeDate}
            onChange={(e) => setPostponeDate(e.target.value)}
            InputProps={{
              inputProps: {
                max: moment().add(1, 'month').format('YYYY-MM-DD'),
                min: moment().format('YYYY-MM-DD'),
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Fortryd</Button>
          <Button onClick={handleSubmit}>Udskyd</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
