import {Typography, Dialog, DialogContent, DialogTitle, DialogActions} from '@mui/material';

import React from 'react';
import Button from '~/components/Button';
import useBreakpoints from '~/hooks/useBreakpoints';

type AddSensorDialogProps = {
  open: boolean;
  onClose: (matchingParameters?: boolean) => void;
  isDisassembling?: boolean;
  disableMatchingParameters?: boolean;
};

const AddSensorDialog = ({
  open,
  onClose,
  isDisassembling,
  disableMatchingParameters,
}: AddSensorDialogProps) => {
  const {isMobile} = useBreakpoints();
  return (
    <Dialog open={open} onClose={() => onClose()} fullScreen={isMobile}>
      <DialogTitle>{isDisassembling ? 'Hjemtag sensorer' : 'Tilføj sensorer'}</DialogTitle>
      <DialogContent>
        <Typography>
          {isDisassembling
            ? `Der ligger flere tidsserier med samme terminal. ${disableMatchingParameters === false ? 'Vil du gerne hjemtage udstyr fra tidsserier med samme sensor eller hele terminalen?' : 'Vil du gerne hjemtage alle tidsserier med samme terminal?'}`
            : `${disableMatchingParameters === false ? 'Den valgte sensor på terminalen kan måle flere parametre. Vil du gerne tilføje alle parametre tilknyttet sensoren, eller alle sensorer tilgængelig på terminalen?' : 'Vil du gerne tilføje alle sensorer tilknyttet terminalen?'}`}
        </Typography>
        <DialogActions>
          <Button bttype="tertiary" onClick={() => onClose()}>
            ingen
          </Button>
          <Button
            bttype="primary"
            onClick={() => onClose(true)}
            disabled={disableMatchingParameters}
          >
            Parametre
          </Button>
          <Button bttype="primary" onClick={() => onClose(false)}>
            Sensorer
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default AddSensorDialog;
