import React, { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  useTheme,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import { isValid } from "date-fns";
import { InputAdornment } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import OwnDatePicker from "./OwnDatePicker";

const useStyles = makeStyles({
  root: {
    width: "60%",
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
    marginLeft: "20%",
  },
  mobile: {
    width: "100%",
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
  },
});

export default function MaalepunktForm({
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
  handleCancel,
}) {
  const [disableSubmit, setDisableSubmit] = useState(false);
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  const handleStartdateChange = (date) => {
    if (isValid(date)) {
      console.log("date is valid again: ", date);
      changeFormData("startdate", date);
    }
  };

  const handleEnddateChange = (date) => {
    if (isValid(date)) {
      console.log("date is valid again: ", date);
      changeFormData("enddate", date);
    }
  };

  const handleCommentChange = (e) => {
    changeFormData("mp_description", e.target.value);
  };

  const handleElevationChange = (e) => {
    changeFormData("elevation", e.target.value);
  };

  return (
    <Card 
      style={{ marginBottom: 25 }}
      className={matches ? classes.mobile : classes.root}
    >
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {formData.gid !== -1 ? "Opdater målepunkt" : "Indberet målepunkt"}
        </Typography>
        <Grid container spacing={3} alignItems="center" justify="center">
          <Grid item xs={12} sm={8}>
            <TextField
              type="number"
              variant="outlined"
              label={
                <Typography variant="h5" component="h3">
                  Pejlepunkt [m]
                </Typography>
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">m</InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={formData.elevation}
              onChange={handleElevationChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <OwnDatePicker
              label={"Start dato"}
              value={formData.startdate}
              onChange={(date) => handleStartdateChange(date)}
            />
          </Grid>
          {formData.gid !== -1 && (
            <Grid item xs={12} sm={6}>
                <OwnDatePicker
                  label={"Slut dato"}
                  value={formData.enddate}
                  onChange={(date) => handleEnddateChange(date)}
                />
            </Grid>
          )}
          <Grid item xs={12} sm={10}>
            <TextField
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={formData.mp_description}
              variant="outlined"
              multiline
              rows={4}
              InputLabelProps={{ shrink: true }}
              fullWidth
              onChange={handleCommentChange}
            />
          </Grid>
          <Grid item xs={2} sm={4}></Grid>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              style={{ backgroundColor: theme.palette.secondary }}
              onClick={() => {
                handleClickSubmit();
                handleSubmit();
              }}
              disabled={disableSubmit}
              startIcon={<SaveIcon />}
              color="secondary"
              variant="contained"
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              style={{ backgroundColor: theme.palette.secondary }}
              onClick={handleCancel}
              color="secondary"
              variant="contained"
            >
              Annuler
            </Button>
          </Grid>
          <Grid item xs={2} sm={4}></Grid>
        </Grid>
        <Grid item xs={2} sm={4}></Grid>
      </CardContent>
    </Card>
  );
}
