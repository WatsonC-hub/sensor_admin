import {Typography, Box} from '@mui/material';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {useMutation} from '@tanstack/react-query';
import React, {useState} from 'react';

import Button from '~/components/Button';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {loginAPI, resetPassword} from '~/pages/field/fieldAPI';
import {authStore} from '~/state/store';

export default function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [open, setOpen] = useState(false);
  const [passReset, setPassReset] = useState('');
  const [passResetErr, setPassResetErr] = useState(false);
  const [emailSentMess, setEmailSentMess] = useState(false);
  const {register} = useNavigationFunctions();

  const [setAuthenticated, setLoginExpired, setAuthorization] = authStore((state) => [
    state.setAuthenticated,
    state.setLoginExpired,
    state.setAuthorization,
  ]);

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: loginAPI,
  });

  const handleSubmit = () => {
    loginMutation.mutate(
      {
        username: userName,
        password: password,
      },
      {
        onSuccess: (data) => {
          setLoginError('');
          setAuthorization(data);
          setAuthenticated(true);
          setLoginExpired(false);
        },
      }
    );
  };

  const handlePassReset = () => {
    resetPassword({email: passReset})
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Box
        sx={{
          textAlign: 'center',
          alignSelf: 'center',
        }}
      >
        <Typography variant="h4">Log ind</Typography>
      </Box>

      <Container fixed maxWidth="sm">
        <Typography
          style={{
            textAlign: 'center',
            alignSelf: 'center',
          }}
        >
          Med denne applikation kan du indberette pejlinger, se grafer og flytte rundt på dit
          udstyr.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            onChange={(e) => setUserName(e.target.value)}
            error={!!loginError}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            error={!!loginError}
            helperText={!!loginError && loginError}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
            }}
          >
            <Button
              variant="outlined"
              bttype="link"
              onClick={register}
              sx={{
                m: 0,
                p: 0,
              }}
            >
              Opret konto
            </Button>
            <Button
              variant="outlined"
              bttype="link"
              onClick={handleClickOpen}
              sx={{
                m: 0,
                p: 0,
              }}
            >
              Glemt kodeord?
            </Button>
          </Box>
          <Button
            onClick={handleSubmit}
            fullWidth
            variant="contained"
            bttype="primary"
            disabled={userName === '' || password === ''}
          >
            Log på
          </Button>
        </Box>
      </Container>
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
