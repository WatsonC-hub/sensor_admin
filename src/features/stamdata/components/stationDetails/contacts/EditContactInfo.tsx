import {Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import React from 'react';
import StationContactInfo from './StationContactInfo';
import Button from '~/components/Button';

type Props = {
  openContactInfoDialog: boolean;
  handleClose: () => void;
  handleSave: () => void;
  isDisabled: boolean;
  isUser: boolean;
};

const EditContactInfo = ({
  openContactInfoDialog,
  handleClose,
  handleSave,
  isDisabled,
  isUser,
}: Props) => {
  return (
    <Dialog open={openContactInfoDialog} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Ændre kontakt information</DialogTitle>
      <DialogContent>
        <StationContactInfo isEditing={true} isUser={isUser} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} bttype="tertiary">
          Annuller
        </Button>
        <Button disabled={isDisabled} onClick={handleSave} bttype="primary">
          Ændre kontakt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContactInfo;
