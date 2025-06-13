import {Box, Dialog, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import AlarmForm from './AlarmForm';
import {alarmTable} from '../types';

type AlarmFormDialogProps = {
  // Define the props for the AlarmFormDialog component
  // For example:
  open: boolean;
  onClose: () => void;
  setOpen: (open: boolean) => void;
  alarm?: alarmTable;
};

const AlarmFormDialog = ({open, onClose, setOpen, alarm}: AlarmFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Alarmer</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={1}>
          <AlarmForm setOpen={setOpen} alarm={alarm} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AlarmFormDialog;
