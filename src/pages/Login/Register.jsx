import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { getCvr, createUser } from "src/pages/field/fieldAPI";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState(false);
  const [cvr, setCvr] = useState("");
  const [checkedTerms, setCheckedTerms] = useState(false);
  const [checkedNews, setCheckedNews] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openAwaitDialog, setOpenAwaitDialog] = useState(false);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const navigate = useNavigate();
  const routeChange = () => {
    navigate(`/`);
  };

  const {
    data: cvrData,
    isSuccess,
    isFetched,
  } = useQuery(["cvr", cvr], () => getCvr(cvr), {
    enabled: cvr.length === 8,
    refetchOnWindowFocus: false,
    select: (data) => {
      return {
        ...data.data.orgs[0],
        id: data.data.orgs[0].id !== null ? data.data.orgs[0].id : -1,
      };
    },
  });

  const createUserMutation = useMutation(createUser, {
    onSuccess: (data) => {
      toast.success("Bruger oprettet");
      setOpenAwaitDialog(true);
    },
    onError: (error) => {
      toast.error("Bruger kunne ikke oprettes");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault(); //To avoid refreshing page on button click
    setOpenConfirmDialog(true);
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

    console.log(payload);

    createUserMutation.mutate(payload);
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

  const handleClose = () => {
    setOpenConfirmDialog(false);
  };

  return (
    <div className="form">
      <div
        style={{
          textAlign: "center",
          alignSelf: "center",
        }}
      >
        <Typography variant="h4">Opret konto</Typography>
      </div>

      <Container fixed maxWidth="sm">
        <form onSubmit={handleSubmit} noValidate>
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
            onBlur={(e) => setEmailErr(!validateEmail(email))}
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
            error={isSuccess === false && isFetched === true}
            helperText={
              isSuccess === false && isFetched === true
                ? "CVR blev ikke fundet"
                : ""
            }
            onChange={(e) => setCvr(e.target.value.trim())}
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
            onClick={handleSubmit}
            disabled={
              firstName === "" ||
              lastName === "" ||
              emailErr ||
              cvr.length !== 8 ||
              checkedTerms === false ||
              (isSuccess === false && isFetched === true)
            }
          >
            Opret konto
          </Button>
        </form>
      </Container>

      {isSuccess && (
        <Dialog
          open={openConfirmDialog}
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
                {cvrData.id === -1
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
      )}

      <Dialog
        open={openAwaitDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Typography variant="h5">Afventer fuldførelse</Typography>
        </DialogTitle>
        <DialogContent>
          <div>
            <Typography>
              For at fuldføre oprettelsen, følg instruktionerne i din email.
              Tjek eventuelt spam, hvis du ikke kan finde mailen.
            </Typography>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={routeChange}
            variant="outlined"
            color="primary"
            autoFocus
          >
            Til log ind
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
