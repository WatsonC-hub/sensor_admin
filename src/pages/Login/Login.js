import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
//import { ReactComponent as CalypsoLogo } from "../../calypso.svg";
import logo from "../../calypso.svg";
import axios from "axios";

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

const loginUser = (user, password) => {
  let sessionUrl = "https://watsonc.admin.gc2.io/api/v2/session/start";
  sessionUrl = "http://localhost:8080/api/v2/session/start";
  const loginData = {
    user,
    password,
    schema: null,
  };
  return axios.post(sessionUrl, loginData);
};

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
        //console.log(res.data);
      })
      .catch((r) => {
        setLoginError(true);
        console.log("login error => ", r);
      });
    //setToken("random-token");
  };

  return (
    <form className={classes.form} onSubmit={handleSubmit} noValidate>
      <TextField
        variant='outlined'
        margin='normal'
        required
        fullWidth
        id='email'
        label='Email'
        name='email'
        autoComplete='email'
        autoFocus
        onChange={(e) => setUserName(e.target.value)}
        error={loginError}
      />
      <TextField
        variant='outlined'
        margin='normal'
        required
        fullWidth
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
        onChange={(e) => setPassword(e.target.value)}
        error={loginError}
        helperText={loginError ? "brugernavn eller password er forkert." : ""}
      />
      <Button
        type='submit'
        fullWidth
        variant='contained'
        style={{ backgroundColor: "rgb(0,150,136)", color: "white" }}
        className={classes.submit}
        disabled={userName === "" || password === ""}
      >
        Log på
      </Button>
    </form>
  );
  return (
    <div>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <div className={classes.paper}>
          <div
            style={{
              backgroundColor: "rgb(0,150,136)",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* <CalypsoLogo /> */}
            <img src={logo} alt='logo' />
          </div>
          <form className={classes.form} onSubmit={handleSubmit} noValidate>
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email'
              name='email'
              autoComplete='email'
              autoFocus
              onChange={(e) => setUserName(e.target.value)}
              error={loginError}
            />
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              onChange={(e) => setPassword(e.target.value)}
              error={loginError}
              helperText={
                loginError ? "brugernavn eller password er forkert." : ""
              }
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              style={{ backgroundColor: "rgb(0,150,136)", color: "white" }}
              className={classes.submit}
              disabled={userName === "" || password === ""}
            >
              Log på
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
  return <p>I can log in</p>;
}
