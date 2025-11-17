import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
} from '@mui/material';
import React from 'react';
import Button from '~/components/Button';

type DeleteLocationProps = {
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};
const DeleteLocationDialog = ({open, onDelete, onClose}: DeleteLocationProps) => {
  const [confirmationText, setConfirmationText] = React.useState('');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Er du sikker på, at du vil slette denne lokation?</DialogTitle>
      <DialogContent>
        <Box alignItems={'center'} display="flex" flexDirection="column" gap={2}>
          <Typography>
            Sletter du lokationen, vil alle tilknyttede nøgler, kontakter, huskeliste og billeder
            også blive slettet. Denne handling kan ikke fortrydes.
          </Typography>
          <Typography>Indtast venligst &quot;slet mig&quot; for at bekræfte.</Typography>
          <TextField variant="outlined" onChange={(e) => setConfirmationText(e.target.value)} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" onClick={onClose}>
          Annuller
        </Button>
        <Button bttype="danger" onClick={onDelete} disabled={confirmationText !== 'slet mig'}>
          Slet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteLocationDialog;
