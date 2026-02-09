import {Delete} from '@mui/icons-material';
import {
  DialogActions,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';

import React from 'react';
import Button from '~/components/Button';

type DeleteTimeseriesProps = {
  open: boolean;
  description: string;
  isPending?: boolean;
  onDelete: () => void;
  onClose: () => void;
};

const ConfirmDeleteDialog = ({
  open,
  description,
  isPending = false,
  onDelete,
  onClose,
}: DeleteTimeseriesProps) => {
  const [confirmationText, setConfirmationText] = React.useState('');

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Er du sikker på, at du vil slette?</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography>{description}</Typography>
          <Typography>
            <strong>
              For at bekræfte sletning, skriv <em>&quot;bekræft&quot;</em> i feltet
            </strong>
          </Typography>
          <TextField
            variant="outlined"
            placeholder="bekræft"
            autoFocus
            focused
            onChange={(e) => setConfirmationText(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" onClick={handleClose}>
          Annuller
        </Button>
        <Button
          bttype="danger"
          onClick={onDelete}
          startIcon={isPending ? <CircularProgress size="1rem" color="inherit" /> : <Delete />}
          disabled={confirmationText !== 'bekræft' || isPending}
        >
          Slet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
