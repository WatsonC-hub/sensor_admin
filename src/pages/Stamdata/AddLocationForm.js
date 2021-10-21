import React, { useState } from "react";
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
  saveLocationFormData,
}) {
  const [open, setOpen] = React.useState(false);
  const [locationData, setLocationData] = useState({
    locname: "",
    x: "",
    y: "",
    terrainlevel: "",
    terrainqual: "",
    mainloc: "",
    subloc: "",
    subsubloc: "",
    description: "",
  });

  const handleChange = (event) => {
    setLocationData({
      ...locationData,
      [event.target.id]: event.target.value,
    });
  };

  const handleSave = () => {
    // TODO: validate data.
    saveLocationFormData(locationData);
    setLocationDialogOpen(false);
  };

  const handleClickOpen = () => {
    setLocationDialogOpen(true);
  };

  const handleClose = () => {
    setLocationDialogOpen(false);
  };

  return (
    <div>
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
            id='locname'
            label='Navn'
            value={locationData.locname}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='mainloc'
            label='Hoved lokation'
            value={locationData.mainloc}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='subloc'
            label='Under lokation'
            value={locationData.subloc}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='subsubloc'
            label='Under-under lokation'
            value={locationData.subsubloc}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='x'
            label='X-koordinat(UTM)'
            value={locationData.x}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='y'
            label='Y-koordinat (UTM)'
            value={locationData.y}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='terrainlevel'
            label='Terrænkote'
            value={locationData.terrainlevel}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='terrainqual'
            label='Type af terrænkote'
            value={locationData.terrainqual}
            onChange={handleChange}
            type='text'
            fullWidth
          />
          <TextField
            autoFocus
            margin='dense'
            id='description'
            label='Kommentar'
            value={locationData.description}
            onChange={handleChange}
            type='text'
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} color='primary'>
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
