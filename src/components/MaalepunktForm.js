import React, { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { isValid } from "date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
  DateTimePicker,
} from "@material-ui/pickers";

export default function MaalepunktForm({
  stationId,
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
}) {
  const [currDate, setCurrDate] = useState(formData.startdate);

  const handleDateChange = (date) => {
    if (isValid(date)) {
      setCurrDate(date);
    }
    if (isValid(date)) {
      console.log("date is valid again: ", date);
      changeFormData("startdate", date);
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
            Indberet målepunkt
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                autoOk
                disableToolbar
                inputVariant="outlined"
                variant="outlined"
                format="yyyy-MM-dd HH:mm"
                id="Fra"
                label={
                  <Typography variant="h6" component="h3">
                    Startdato
                  </Typography>
                }
                InputLabelProps={{ shrink: true }}
                value={formData.startdate}
                onChange={(date) => handleDateChange(date)}
                fullWidth
              />
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
                style={{ backgroundColor: "#ffa137" }}
                onClick={() => handleSubmit(stationId)}
              >
                Gem
              </Button>
            </Grid>
            <Grid item xs={4} sm={2}>
              <Button
                autoFocus
                style={{ backgroundColor: "#ffa137" }}
                onClick={resetFormData}
              >
                Annuler
              </Button>
            </Grid>
            <Grid item xs={2} sm={4}></Grid>
          </Grid>
        </CardContent>
      </Card>
    </MuiPickersUtilsProvider>
  );
}
