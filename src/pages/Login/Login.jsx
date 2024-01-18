import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import React, {useState} from 'react';

import {Typography} from '@mui/material';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {loginAPI, resetPassword} from 'src/pages/field/fieldAPI';
import {authStore} from '../../state/store';

export default function Login({}) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [open, setOpen] = useState(false);
  const [passReset, setPassReset] = useState('');
  const [passResetErr, setPassResetErr] = useState(false);
  const [emailSentMess, setEmailSentMess] = useState(false);

  const [setAuthenticated, setLoginExpired, setAuthorization] = authStore((state) => [
    state.setAuthenticated,
    state.setLoginExpired,
    state.setAuthorization,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    loginAPI(userName.toLowerCase().trim(), password)
      .then((res) => {
        setLoginError('');
        setAuthorization(res.data);
        setAuthenticated(true);
        setLoginExpired(false);
        window.localStorage.setItem('calypso_csrf_token', res.data.csrf_token);
      })
      .catch((err) => {
        console.log(err);
        setLoginError(err.response.data.detail);
      });
  };

  const handlePassReset = (e) => {
    resetPassword({email: passReset})
      .then((res) => {
        setPassResetErr(false);
        handleEmailSent();
      })
      .catch((r) => {
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
    <div>
      <div
        style={{
          textAlign: 'center',
          alignSelf: 'center',
        }}
      >
        <Typography variant="h4">Log ind</Typography>
      </div>

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
        {/* {loginExpired && (
          <Typography
            style={{
              textAlign: 'center',
              alignSelf: 'center',
              color: 'red',
            }}
          >
            Din session er udløbet. Log venligst ind igen.
          </Typography>
        )} */}
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={userName === '' || password === ''}
            style={{marginTop: '1%'}}
          >
            Log på
          </Button>
        </form>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleClickOpen}
          style={{marginTop: '1.5%'}}
        >
          Glemt kodeord?
        </Button>
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
          <div>
            <Typography>
              {emailSentMess === true ? (
                'En E-mail er er blevet sendt med instruktioner for hvordan du nulstiller dit kodeord!'
              ) : (
                <div>
                  <Typography>Nulstil dit kodeord ved at indtaste din E-mail adresse</Typography>
                  <TextField
                    autoFocus
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
          <Button onClick={handleClose} color="primary">
            Annuller
          </Button>
          {!emailSentMess && (
            <Button onClick={handlePassReset} variant="outlined" color="primary" autoFocus>
              Bekræft
            </Button>
          )}
          {emailSentMess && (
            <Button onClick={handleClose} variant="outlined" color="primary" autoFocus>
              Gå til log ind
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
