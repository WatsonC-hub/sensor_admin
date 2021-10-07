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

export default function AddLocationForm({
  locationDialogOpen,
  setLocationDialogOpen,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setLocationDialogOpen(true);
  };

  const handleClose = () => {
    setLocationDialogOpen(false);
  };

  return (
    <div>
      {/* <Button variant='outlined' color='primary' onClick={handleClickOpen}>
        Open form dialog
      </Button> */}
      <Dialog
        open={locationDialogOpen}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>Tilføj lokation</DialogTitle>
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
            label='X-koordinat(UTM)'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Y-koordinat (UTM)'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Terrænkote'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Mainloc'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Subloc'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Subsubloc'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Description'
            type='email'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='name'
            label='Type af terrænkote'
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
