import {Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';

type DeleteLocationProps = {
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};
const DeleteLocationDialog = (props: DeleteLocationProps) => {
  const {open, onClose, onDelete} = props;
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Er du sikker på, at du vil slette denne lokation?</DialogTitle>
      <DialogContent>
        Sletter du lokationen, vil alle tilknyttede nøgler, kontakter, huskeliste og billeder også
        blive slettet. Denne handling kan ikke fortrydes.
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" onClick={onClose}>
          Annuller
        </Button>
        <Button bttype="danger" onClick={onDelete}>
          Slet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLocationDialog;
