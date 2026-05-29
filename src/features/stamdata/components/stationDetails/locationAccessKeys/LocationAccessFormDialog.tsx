import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import {SubmitHandler, useFormContext} from 'react-hook-form';

import Button from '~/components/Button';
import {initialLocationAccessData} from '~/consts';
import {Access} from '~/types';
import {Save} from '@mui/icons-material';
import LocationAccessForm from './LocationAccessForm';
import {TypedFormComponent} from '~/components/formComponents/Form';

type Props = {
  loc_id?: number | undefined;
  editMode?: 'create' | 'edit' | 'modal';
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  handleSave: SubmitHandler<Access>;
  showLocationAccess?: boolean;
  Form: TypedFormComponent<Access, Access>;
};

const LocationAccessFormDialog = ({
  loc_id,
  editMode = 'create',
  openDialog,
  setOpenDialog,
  handleSave,
  showLocationAccess,
  Form,
}: Props) => {
  const {
    reset,
    clearErrors,
    handleSubmit,
    formState: {isSubmitting},
  } = useFormContext<Access>();

  const handleClose = () => {
    reset(initialLocationAccessData);
    clearErrors();
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth>
      <DialogTitle id="form-dialog-title">Vælg nøgle eller kode</DialogTitle>
      <DialogContent>
        <LocationAccessForm
          loc_id={loc_id}
          showLocationAccess={showLocationAccess}
          disabled={editMode === 'modal'}
          Form={Form}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} bttype="tertiary">
          Annuller
        </Button>
        <Button
          onClick={async () => {
            await handleSubmit(handleSave, (error) => console.log(error))();
            reset(initialLocationAccessData);
          }}
          bttype="primary"
          startIcon={isSubmitting ? undefined : <Save />}
          loading={isSubmitting}
        >
          Gem
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationAccessFormDialog;
