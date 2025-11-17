import {
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  Box,
} from '@mui/material';

import React from 'react';
import Button from '~/components/Button';

type DeleteTimeseriesProps = {
  open: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const DeleteTimeseriesDialog = ({open, onDelete, onClose}: DeleteTimeseriesProps) => {
  const [confirmationText, setConfirmationText] = React.useState('');
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Er du sikker på, at du vil slette denne tidsserie?</DialogTitle>
      <DialogContent>
        <Box alignItems={'center'} display="flex" flexDirection="column" gap={2}>
          <Typography>
            Dette vil slette alle kontrolmålinger, opgaver, målepunkter og konfigurationer knyttet
            til denne tidsserie. Denne handling kan ikke fortrydes.
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

export default DeleteTimeseriesDialog;
