import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';
import {useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import LocationForm from '~/pages/field/stamdata/components/LocationForm';

interface AddLocationFormProps {
  locationDialogOpen: boolean;
  setLocationDialogOpen: (open: boolean) => void;
}

export default function AddLocationForm({
  locationDialogOpen,
  setLocationDialogOpen,
}: AddLocationFormProps) {
  const handleSave = async () => {
    const result = await trigger('location');
    setLocationDialogOpen(!result);
    console.log(getFieldState('location'));
    console.log(getValues().location);
  };

  const {reset, trigger, getFieldState, getValues} = useFormContext();

  const handleClose = () => {
    reset({
      location: {
        loc_name: '',
        mainloc: '',
        subloc: '',
        subsubloc: '',
        x: 0,
        y: 0,
        terrainqual: '',
        terrainlevel: 0,
        description: '',
        loctype_id: -1,
        initial_project_no: '',
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
