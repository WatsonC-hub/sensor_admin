import React, { useState, useRef } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { isValid, format } from "date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

export default function PejlingForm({
  stationId,
  setShowForm,
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
}) {
  const [currDate, setCurrDate] = useState(formData.timeofmeas);
  const handleUsageChange = (e) => {
    changeFormData("useforcorrection", e.target.value);
  };

  const handleDateChange = (date) => {
    if (isValid(date)) {
      setCurrDate(date);
    }
    //only change submit data when date is valid
    if (isValid(date)) {
      console.log("date is valid again: ", date);
      changeFormData("timeofmeas", date);
    }
  };

  const handleCommentChange = (e) => {
    changeFormData("comment", e.target.value);
  };

  const handleDistanceChange = (e) => {
    changeFormData("disttowatertable_m", e.target.value);
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Card style={{ marginBottom: 25 }}>
        <CardContent>
          <Typography gutterBottom variant='h5' component='h2'>
            Indberet pejling
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <KeyboardDatePicker
                disableToolbar
                variant='inline'
                inputProps={{ readOnly: true }}
                inputVariant='outlined'
                format='yyyy-MM-dd'
                margin='normal'
                id='date-picker-inline'
                label={
                  <Typography variant='h6' component='h3'>
                    Dato
                  </Typography>
                }
                InputLabelProps={{ shrink: true }}
                value={new Date(currDate)}
                onChange={(date) => handleDateChange(date)}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <KeyboardTimePicker
                placeholder={currDate}
                inputVariant='outlined'
                inputProps={{ readOnly: true }}
                margin='normal'
                id='overnat_start_tid'
                label={
                  <Typography variant='h6' component='h3'>
                    Tidspunkt
                  </Typography>
                }
                InputLabelProps={{ shrink: true }}
                value={new Date(currDate)}
                onChange={(date) => handleDateChange(date)}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
                fullWidth
                ampm={false}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                type='number'
                variant='outlined'
                label={
                  <Typography variant='h6' component='h3'>
                    pejling
                  </Typography>
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={formData.disttowatertable_m}
                onChange={handleDistanceChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography>Afstand fra pejlpunktskote til vandspejl</Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label={
                  <Typography variant='h6' component='h3'>
                    Kommentar
                  </Typography>
                }
                value={formData.comment}
                variant='outlined'
                multiline
                rows={4}
                InputLabelProps={{ shrink: true }}
                fullWidth
                onChange={handleCommentChange}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl component='fieldset'>
                <FormLabel component='h6'>
                  Hvordan skal pejlingen anvendes?
                </FormLabel>
                <RadioGroup
                  value={formData.useforcorrection + ""}
                  onChange={handleUsageChange}
                >
                  <FormControlLabel
                    value='0'
                    control={<Radio />}
                    label='(0) Anvendes ikke'
                  />
                  <FormControlLabel
                    value='1'
                    control={<Radio />}
                    label='(1) Anvendes til korrektion fremadrettet'
                  />
                  <FormControlLabel
                    value='2'
                    control={<Radio />}
                    label='(2) Anvendes til korrektion bagud og fremadrettet'
                  />
                </RadioGroup>
              </FormControl>
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
