import React from "react";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";

const OwnDatePicker = (props) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <KeyboardDateTimePicker
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
        fullWidth
        error={props.error}
        helperText={props.helperText}
      />
    </MuiPickersUtilsProvider>
  );
};

export default OwnDatePicker;
