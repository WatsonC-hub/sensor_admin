import React from "react";
import { KeyboardDateTimePicker } from "@material-ui/pickers";

const OwnDatePicker = (props) => {
  return (
    <KeyboardDateTimePicker
      disabled={props.disabled}
      disableToolbar
      // inputProps={{ readOnly: true }}
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
  );
};

export default OwnDatePicker;
