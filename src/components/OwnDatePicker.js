import React from "react";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";

const OwnDatePicker = ({ value, onChange, label, disabled }) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <KeyboardDateTimePicker
        disabled={disabled}
        disableToolbar
        inputProps={{ readOnly: true }}
        ampm={false}
        showTodayButton={true}
        inputVariant="outlined"
        format="yyyy-MM-dd HH:mm"
        margin="dense"
        id={label}
        label={label}
        cancelLabel="Anuller"
        todayLabel="I dag"
        invalidDateMessage="Ugyldig dato"
        invalidLabel="Ukendt"
        InputLabelProps={{ shrink: true }}
        value={value}
        onChange={onChange}
        KeyboardButtonProps={{
          "aria-label": "change date",
        }}
        fullWidth
      />
    </MuiPickersUtilsProvider>
  );
};

export default OwnDatePicker;
