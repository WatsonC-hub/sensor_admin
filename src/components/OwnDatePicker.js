import React from "react";
import { KeyboardDateTimePicker } from "@material-ui/pickers";

const OwnDatePicker = ({ value, onChange, label, disabled }) => {
  return (
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
  );
};

export default OwnDatePicker;
