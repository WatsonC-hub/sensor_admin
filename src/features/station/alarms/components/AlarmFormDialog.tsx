import {Dialog, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import AlarmForm from './AlarmForm';
import {alarmTable} from '../types';

type AlarmFormDialogProps = {
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
        <AlarmForm setOpen={setOpen} alarm={alarm} />
      </DialogContent>
    </Dialog>
  );
};

export default AlarmFormDialog;
