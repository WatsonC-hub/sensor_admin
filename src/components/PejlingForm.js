import React, { useState } from "react";
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
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

export default function PejlingForm({ setShowForm }) {
  // const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [usage, setUsage] = React.useState("0");

  const handleUsageChange = (e) => {
    console.log("target value: ", e.target.value);
    setUsage(e.target.value);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  const handleSave = () => {
    setShowForm(false);
  };
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Card style={{ marginBottom: 25 }}>
        <CardContent>
          <Typography gutterBottom variant='h5' component='h2'>
            Indberet pejling
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <KeyboardDatePicker
                disableToolbar
                variant='inline'
                inputVariant='outlined'
                format='yyyy-MM-dd'
                margin='normal'
                id='date-picker-inline'
                label={
                  <Typography variant='h6' component='h3'>
                    Dato
                  </Typography>
                }
                value={selectedDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <KeyboardTimePicker
                inputVariant='outlined'
                margin='normal'
                id='overnat_start_tid'
                label={
                  <Typography variant='h6' component='h3'>
                    Tidspunkt
                  </Typography>
                }
                value={selectedDate}
                onChange={handleDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                variant='outlined'
                label={
                  <Typography variant='h6' component='h3'>
                    pejling
                  </Typography>
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <Typography>Afstand fra pejlpunktskote til vandspejl</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={
                  <Typography variant='h6' component='h3'>
                    Kommentar
                  </Typography>
                }
                variant='outlined'
                multiline
                rows={4}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component='fieldset'>
                <FormLabel component='h6'>
                  Hvordan skal pejlingen anvendes?
                </FormLabel>
                <RadioGroup value={usage} onChange={handleUsageChange}>
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
            <Grid item xs={4}></Grid>
            <Grid item xs={2}>
              <Button
                autoFocus
                style={{ backgroundColor: "#ffa137" }}
                onClick={(e) => handleSave(false)}
              >
                Gem
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                autoFocus
                style={{ backgroundColor: "#ffa137" }}
                onClick={(e) => handleSave(false)}
              >
                Annullere
              </Button>
            </Grid>
            <Grid item xs={4}></Grid>
          </Grid>
        </CardContent>
      </Card>
    </MuiPickersUtilsProvider>
  );
}
