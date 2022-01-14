import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { getCvr } from "../../api";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import { Typography } from "@material-ui/core";

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

export default function Register() {
  const classes = useStyles();
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [cvr, setCvr] = useState("");
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [cvrData, setCvrData] = useState({});

  const validEmail = new RegExp(
    "^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$"
  );

  const validateEmail = () => {
    if (!validEmail.test(email)) {
      setEmailErr(true);
    } else if (validEmail.test(email)) {
      setEmailErr(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); //To avoid refreshing page on button click
    //const cvr = getCvr(cvr).then((res) => console.log(res));

    // const cvrData = getCvr(cvr);
    // console.log(cvrData);

    validateEmail();
    console.log("hejsa");
    if (emailErr === false) {
      console.log("hej");
      getCvr(cvr)
        .then((res) => {
          setCvrData(res.data.orgs[0]);
          console.log(res.data.orgs[0]);
          setSeverity("success");
          setOpenAlert(true);
          setTimeout(() => {
            handleClickOpen();
          }, 500);
        })
        .catch((error) => {
          setSeverity("error");
          setOpenAlert(true);
        });
    } else {
      setSeverity("error");
      setOpenAlert(true);
    }
  };

  const handleChange = (event) => {
    if (!checked)
      setChecked({ ...checked, [event.target.name]: event.target.checked });
    else if (checked) setChecked(false);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleCloseSnack = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="form">
      <div
        style={{
          textAlign: "center",
          alignSelf: "center",
        }}
      >
        <h1>Opret konto</h1>
      </div>

      <Container fixed maxWidth="sm">
        <form className={classes.form} onSubmit={handleSubmit} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="Fornavn"
            name="firstName"
            autoComplete="firstName"
            autoFocus
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Efternavn"
            name="lastName"
            autoComplete="lastName"
            autoFocus
            onChange={(e) => setLastName(e.target.value)}
          />
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
            onChange={(e) => setEmail(e.target.value)}
            error={emailErr}
            helperText={emailErr ? "Din email er ugyldig" : ""}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="cvr"
            label="CVR"
            name="cvr"
            autoComplete="cvr"
            autoFocus
            onChange={(e) => setCvr(e.target.value)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={checked.checked}
                onChange={handleChange}
                name="checkedTerms"
                color="primary"
              />
            }
            label={
              <label>
                Jeg accepterer Calypsos{" "}
                <a href="https://watsonc.dk/privatlivspolitik/">vilkår</a>
              </label>
            }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
            disabled={
              firstName === "" ||
              lastName === "" ||
              email === "" ||
              cvr === "" ||
              checked === false
            }
          >
            Opret konto
          </Button>
        </form>
      </Container>
      <Snackbar
        open={openAlert}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
      >
        <Alert onClose={handleClose} severity={severity}>
          {severity === "success"
            ? "Oprettelsen lykkedes"
            : "Oprettelsen fejlede"}
        </Alert>
      </Snackbar>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h5">Bekræft virksomhed</Typography>
        </DialogTitle>
        <DialogContent>
          <div>
            <Typography>
              Virksomheden er allerede oprettet. Der vil blive sendt en
              anmodning til nedenstående virksomhed, om at du kan oprettes i
              denne. Hvorefter du vil modtage en bekræftigelsesmail.
            </Typography>
            <Typography>
              {cvrData.name}
              <br></br>
              {cvrData.address}
              <br></br>
              {cvrData.zip + " " + cvrData.city}
              <br></br>
              {cvr}
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="primary"
            autoFocus
          >
            Bekræft
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
