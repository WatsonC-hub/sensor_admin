import React from "react";
import { Grid, TextField } from "@material-ui/core";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
  KeyboardDateTimePicker,
} from "@material-ui/pickers";
import { StamdataContext } from "../StamdataContext";
import moment from "moment";

export default function UdstyrForm(props) {
  const editMode = props.mode === "edit";
  const [, , formData, , , , , setUdstyrValue] =
    React.useContext(StamdataContext);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{
              style: { color: 'black'}
            }}
            disabled={formData.location.locname === "" ? true : false}
            variant='outlined'
            type='text'
            id='terminal'
            value={formData.udstyr.terminal}
            label='Terminal'
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("terminal", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{
              style: { color: 'black'}
            }}
            disabled={formData.location.locname === "" ? true : false}
            variant='outlined'
            type='text'
            label='Terminal ID'
            value={formData.udstyr.terminal_id}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("terminal_id", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{
              style: { color: 'black'}
            }}
            disabled={formData.location.locname === "" ? true : false}
            focused={false}
            variant='outlined'
            type='text'
            label='CALYPSO ID'
            value={formData.udstyr.calypso_id}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("calypso_id", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{
              style: { color: 'black'}
            }}
            disabled={formData.location.locname === "" ? true : false}
            variant='outlined'
            type='text'
            label='Sensor'
            value={formData.udstyr.sensorinfo}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("sensorinfo", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{
              style: { color: 'black'}
            }}
            disabled={formData.location.locname === "" ? true : false}
            variant='outlined'
            type='text'
            label='Sensor ID'
            value={formData.udstyr.sensor_id}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("sensor_id", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          {!editMode ? (
            <TextField
              InputProps={{
                style: { color: 'black'}
              }}
              disabled={formData.location.locname === "" ? true : false}
              variant='outlined'
              type='text'
              label='Startdato'
              value={
                formData.udstyr.startdato
                  ? moment(formData.udstyr.startdato).format('YYYY-MM-DD HH:mm')
                  : ""
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin='dense'
            />
          ) : (
            <KeyboardDateTimePicker
              disableToolbar
              inputProps={{ readOnly: true }}
              inputVariant='outlined'
              format='yyyy-MM-dd HH:mm'
              margin='normal'
              id='date-picker-inline'
              label='Startdato'
              InputLabelProps={{ shrink: true }}
              value={formData.udstyr.startdato}
              onChange={(date) => setUdstyrValue("startdato", date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              fullWidth
            />
          )}
        </Grid>
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
