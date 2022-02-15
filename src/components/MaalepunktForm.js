import React from "react";
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

export default function MaalepunktForm({
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
  handleCancel,
}) {
  const handleStartdateChange = (date) => {
    if (isValid(date)) {
      console.log("date is valid again: ", date);
      changeFormData("startdate", date);
    }
  };
  const theme = useTheme();

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
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Card style={{ marginBottom: 25 }}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {formData.gid !== -1 ? "Opdater målepunkt" : "Indberet målepunkt"}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <OwnDatePicker
                label={"Start dato"}
                value={formData.startdate}
                onChange={(date) => handleStartdateChange(date)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {formData.gid !== -1 && (
                <OwnDatePicker
                  label={"Slut dato"}
                  value={formData.enddate}
                  onChange={(date) => handleEnddateChange(date)}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                type="number"
                variant="outlined"
                label={
                  <Typography variant="h6" component="h3">
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
            <Grid item xs={12} sm={12}>
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
                onClick={handleCancel}
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
