import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { loginUser } from "../../api";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function Login({ setUser }) {
  const classes = useStyles();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);

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
  };

  return (
    <Container fixed maxWidth="sm">
      <form className={classes.form} onSubmit={handleSubmit} noValidate>
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
          helperText={loginError ? "brugernavn eller password er forkert." : ""}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          style={{ backgroundColor: "rgb(0,120,109)", color: "white" }}
          className={classes.submit}
          disabled={userName === "" || password === ""}
        >
          Log på
        </Button>
      </form>
    </Container>
  );
}
