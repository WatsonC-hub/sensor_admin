import {Dialog, DialogContent, DialogTitle} from '@mui/material';
import React from 'react';
import AlarmForm from './AlarmForm';
import {alarmTable} from '../types';
import TooltipWrapper from '~/components/TooltipWrapper';

type AlarmFormDialogProps = {
  open: boolean;
  onClose: () => void;
  setOpen: (open: boolean) => void;
  alarm?: alarmTable;
};

const AlarmFormDialog = ({open, onClose, setOpen, alarm}: AlarmFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle justifyContent="left" display="flex" gap={1} alignItems="center">
        <TooltipWrapper description="I denne dialog kan du registrere en alarm på en til flere notifikationer. Herunder meddeler du hvordan kontakter skal adviseres.">
          Alarmer
        </TooltipWrapper>
      </DialogTitle>
      <DialogContent>
        <AlarmForm setOpen={setOpen} alarm={alarm} />
      </DialogContent>
    </Dialog>
  );
};

export default AlarmFormDialog;
