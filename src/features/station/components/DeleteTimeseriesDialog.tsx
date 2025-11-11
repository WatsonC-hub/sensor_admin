import {DialogActions, Dialog, DialogContent, DialogTitle} from '@mui/material';

import React from 'react';
import Button from '~/components/Button';

type DeleteTimeseriesProps = {
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DeleteTimeseriesDialog = ({open, onDelete, onClose}: DeleteTimeseriesProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Er du sikker på, at du vil slette denne tidsserie?</DialogTitle>
      <DialogContent>
        Dette vil slette alle kontrolmålinger, opgaver, målepunkter og konfigurationer knyttet til
        denne tidsserie. Denne handling kan ikke fortrydes.
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

export default DeleteTimeseriesDialog;
