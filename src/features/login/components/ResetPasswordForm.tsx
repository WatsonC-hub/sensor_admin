import {
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  Box,
  Dialog,
  DialogTitle,
} from '@mui/material';
import React, {useState} from 'react';

import Button from '~/components/Button';

import {resetPassword} from '../api/fieldApi';

interface Props {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

export default function ResetPasswordForm({open, setOpen}: Props) {
  const [passReset, setPassReset] = useState('');
  const [passResetErr, setPassResetErr] = useState(false);
  const [emailSentMess, setEmailSentMess] = useState(false);

  const handlePassReset = () => {
    resetPassword(passReset)
      .then(() => {
        setPassResetErr(false);
        handleEmailSent();
      })
      .catch(() => {
        setPassResetErr(true);
      });
  };

  const handleEmailSent = () => {
    setEmailSentMess(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h5">Nulstil kodeord</Typography>
        </DialogTitle>
        <DialogContent>
          <div>
            <Typography>
              {emailSentMess === true ? (
                'En E-mail er er blevet sendt med instruktioner for hvordan du nulstiller dit kodeord!'
              ) : (
                <div>
                  <Typography>Nulstil dit kodeord ved at indtaste din E-mail adresse</Typography>
                  <TextField
                    margin="dense"
                    id="passReset"
                    label="E-mail addresse"
                    type="email"
                    onChange={(e) => setPassReset(e.target.value)}
                    fullWidth
                    error={passResetErr}
                    //helperText={loginError ? "E-mail eksisterer ikke i systemet" : ""}
                  />
                </div>
              )}
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} bttype="tertiary">
            Annuller
          </Button>
          {!emailSentMess && (
            <Button onClick={handlePassReset} bttype="primary">
              Bekræft
            </Button>
          )}
          {emailSentMess && (
            <Button onClick={handleClose} bttype="primary">
              Gå til log ind
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
