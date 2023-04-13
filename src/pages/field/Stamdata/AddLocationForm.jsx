import React, {useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LocationForm from './components/LocationForm';
import {useFormContext} from 'react-hook-form';

export default function AddLocationForm({locationDialogOpen, setLocationDialogOpen}) {
  const handleSave = async () => {
    const result = await formMethods.trigger('location');
    setLocationDialogOpen(!result);
  };

  const formMethods = useFormContext();

  const handleClose = () => {
    formMethods.reset({
      location: {
        loc_id: '',
        loc_name: '',
        mainloc: '',
        subloc: '',
        subsubloc: '',
        x: '',
        y: '',
        terrainqual: '',
        terrainlevel: '',
        description: '',
        loctype_id: '',
      },
    });
    setLocationDialogOpen(false);
  };

  return (
    <Dialog open={locationDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Tilføj ny lokation</DialogTitle>
      <DialogContent>
        <LocationForm mode="modal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="secondary" variant="contained">
          Tilføj
        </Button>
        <Button onClick={handleClose} color="secondary" variant="contained">
          Annuller
        </Button>
      </DialogActions>
    </Dialog>
  );
}
