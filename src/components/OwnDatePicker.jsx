import React from "react";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import {
  MobileDateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";
import { TextField } from "@mui/material";

const OwnDatePicker = (props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={daLocale}>
      <MobileDateTimePicker
        disabled={props.disabled}
        disableToolbar
        ampm={false}
        showTodayButton={true}
        inputVariant="outlined"
        format="yyyy-MM-dd HH:mm"
        margin="dense"
        id={props.label}
        label={props.label}
        cancelLabel="Anuller"
        todayLabel="I dag"
        invalidDateMessage="Ugyldig dato"
        invalidLabel="Ukendt"
        InputLabelProps={{ shrink: true }}
        value={props.value}
        onChange={props.onChange}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
        renderInput={(params) => <TextField {...params} />}
        fullWidth
        error={props.error}
        helperText={props.helperText}
      />
    </LocalizationProvider>
  );
};

export default OwnDatePicker;
