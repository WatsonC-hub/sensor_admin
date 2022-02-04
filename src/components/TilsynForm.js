import React, { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  useTheme,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { isValid } from "date-fns";
import daLocale from "date-fns/locale/da";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";
import { InputAdornment } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import OwnDatePicker from "./OwnDatePicker";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";

export default function TilsynForm({
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
}) {
  const handleStartdateChange = (date) => {
    if (isValid(date)) {
      console.log("date is valid again: ", date);
      changeFormData("startdate", date);
    }
  };
  const theme = useTheme();

  const handleCommentChange = (e) => {
    changeFormData("kommentar", e.target.value);
  };

  const handleDateChange = (date) => {
    changeFormData("dato", date);
  };

  const handleChangeBattery = (e) => {
    changeFormData("batteriskift", e.target.checked);
  };

  const handleChangeService = (e) => {
    changeFormData("tilsyn", e.target.checked);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Card style={{ marginBottom: 25 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {formData.gid !== -1 ? "Opdater tilsyn" : "Indberet tilsyn"}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <OwnDatePicker
                label={"Dato"}
                value={formData.dato}
                onChange={(date) => handleDateChange(date)}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.batteriskift}
                    onChange={handleChangeBattery}
                    name="checkedBattery"
                    color="primary"
                  />
                }
                label={<label>Batteriskift</label>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.tilsyn}
                    onChange={handleChangeService}
                    name="checkedService"
                    color="primary"
                  />
                }
                label={<label>Tilsyn</label>}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label={
                  <Typography variant="h6" component="h3">
                    Kommentar
                  </Typography>
                }
                value={formData.kommentar}
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
                onClick={() => handleSubmit()}
                startIcon={<SaveIcon />}
                color="secondary"
                variant="contained"
              >
                Gem
              </Button>
            </Grid>
            <Grid item xs={4} sm={2}>
              <Button
                autoFocus
                style={{ backgroundColor: theme.palette.secondary }}
                onClick={resetFormData}
                color="secondary"
                variant="contained"
              >
                Annuller
              </Button>
            </Grid>
            <Grid item xs={2} sm={4}></Grid>
          </Grid>
        </CardContent>
      </Card>
    </MuiPickersUtilsProvider>
  );
}
