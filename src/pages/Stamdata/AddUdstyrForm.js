import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DateFnsUtils from "@date-io/date-fns";
import { isValid, format } from "date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

export default function AddUdstyrForm({
  ustyrDialogOpen,
  setUdstyrDialogOpen,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setUdstyrDialogOpen(true);
  };

  const handleClose = () => {
    setUdstyrDialogOpen(false);
  };

  return (
    <div>
      {/* <Button variant='outlined' color='primary' onClick={handleClickOpen}>
        Open form dialog
      </Button> */}
      <Dialog
        open={ustyrDialogOpen}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>Tilføj Udstyr</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Calypso ID'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Sensor / Sensor ID'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Fra'
            type='email'
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Gem
          </Button>
          <Button onClick={handleClose} color='primary'>
            Annuller
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
