import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import Container from "@mui/material/Container";
import { loginUser, loginAPI, getUser } from "../../api";
import { useTheme } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { Typography } from "@mui/material";
import { resetPassword } from "../../api";

export default function Login({ setUser }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [open, setOpen] = useState(false);
  const [passReset, setPassReset] = useState("");
  const [passResetErr, setPassResetErr] = useState(false);
  const [emailSentMess, setEmailSentMess] = useState(false);

  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    loginUser(userName, password)
      .then((res) => {
        if (res.data.success) {
          sessionStorage.setItem("user", res.data.data.screen_name);
          sessionStorage.setItem("session_id", res.data.data.session_id);
          console.log("user : ", res.data.data);
          setUser(res.data.data);
          setLoginError(false);
        }
      })
      .catch((r) => {
        setLoginError(true);
        console.log("login error => ", r);
      });

    loginAPI(userName, password).then((res) => {
      console.log("loginAPI => ", res);
      getUser();
    });
  };

  const handlePassReset = (e) => {
    console.log(passReset);
    resetPassword({ email: passReset })
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

  if (emailSentMess) {
  }

  return (
    <div>
      <div
        style={{
          textAlign: "center",
          alignSelf: "center",
        }}
      >
        <h1>Log ind</h1>
      </div>

      <Container fixed maxWidth="sm">
        <p
          style={{
            textAlign: "center",
            alignSelf: "center",
          }}
        >
          Med denne applikation kan du indberette pejlinger, se grafer og flytte
          rundt på dit udstyr.
        </p>
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
            error={loginError}
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
            error={loginError}
            helperText={
              loginError ? "brugernavn eller password er forkert." : ""
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={userName === "" || password === ""}
          >
            Log på
          </Button>
        </form>
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
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
                "En E-mail er er blevet sendt med instruktioner for hvordan du nulstiller dit kodeord!"
              ) : (
                <div>
                  <Typography>
                    Nulstil dit kodeord ved at indtaste din E-mail adresse
                  </Typography>
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
            <Button
              onClick={handlePassReset}
              variant="outlined"
              color="primary"
              autoFocus
            >
              Bekræft
            </Button>
          )}
          {emailSentMess && (
            <Button
              onClick={handleClose}
              variant="outlined"
              color="primary"
              autoFocus
            >
              Gå til log ind
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
