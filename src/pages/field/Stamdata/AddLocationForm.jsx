import Button from '~/components/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import {useFormContext} from 'react-hook-form';
import LocationForm from './components/LocationForm';

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
        <Button onClick={handleClose} bttype="tertiary">
          Annuller
        </Button>
        <Button onClick={handleSave} bttype="primary">
          Tilføj
        </Button>
      </DialogActions>
    </Dialog>
  );
}
