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
import { createUser } from "../../api";
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
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkedNews, setCheckedNews] = useState(false);
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
    validateEmail();

    if (emailErr === false) {
      getCvr(cvr)
        .then((res) => {
          setCvrData(res.data.orgs[0]);
          //console.log(res.data.orgs[0]);
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

  const handleConfirm = (e) => {
    //konstruer payload objekt
    const payload = {
      aux: {
        calypso: {
          mail: checkedNews,
          acceptterms: true,
          license: "free",
        },
      },
      email: email,
      firstName: firstName,
      lastName: lastName,
      id: -1,
      org: cvrData,
      userName: email,
    };
    // console.log(cvrData);
    console.log(payload);
    //createUser(payload);
  };

  const handleChangeTerms = (event) => {
    if (!checkedTerms)
      setCheckedTerms({
        ...checkedTerms,
        [event.target.name]: event.target.checked,
      });
    else if (checkedTerms) setCheckedTerms(false);
  };

  const handleChangeNews = (event) => {
    if (!checkedNews)
      setCheckedNews({
        ...checkedNews,
        [event.target.name]: event.target.checked,
      });
    else if (checkedNews) setCheckedNews(false);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

  const handleCloseSnack = (reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAlert(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
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
            onChange={(e) => setCvr(e.target.value)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={checkedTerms.checked}
                onChange={handleChangeTerms}
                name="checkedTerms"
                color="primary"
              />
            }
            label={
              <label>
                Jeg accepterer Calypsos{" "}
                <a href="https://watsonc.dk/privatlivspolitik/" target="_blank">
                  vilkår
                </a>
              </label>
            }
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={checkedNews.checked}
                onChange={handleChangeNews}
                name="checkedNews"
                color="primary"
              />
            }
            label={
              <label>Jeg vil gerne modtage mails om nyheder i Calypso</label>
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
              checkedTerms === false
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
              {cvrData.id === null
                ? "Denne organisation er ikke oprettet. Du vil blive ejeren af den nedenstående organisation og skal fremad rettet godkende andre brugere der tilknytter sig denne organisation. Følg instruktionerne i din email for at fuldføre oprettelsen."
                : "Virksomheden er allerede oprettet. Der vil blive sendt en anmodning til nedenstående virksomhed, om at du kan oprettes i denne. Hvorefter du vil modtage en bekræftigelsesmail."}
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
          <Button onClick={handleClose} color="primary">
            Annuller
          </Button>
          <Button
            onClick={handleConfirm}
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
