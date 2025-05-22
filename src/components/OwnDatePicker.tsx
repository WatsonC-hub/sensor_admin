import {TextField} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment/moment';
import React from 'react';

interface OwnDatePickerProps {
  label: string | React.ReactNode;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  value: Date | null;
  onChange: (date: Date) => void;
  max?: Date | null;
  min?: Date | null;
  sx?: object;
  fullWidth?: boolean;
}

const OwnDatePicker = ({
  label,
  onChange,
  value,
  disabled,
  error,
  fullWidth,
  helperText,
  max,
  min,
  sx,
}: OwnDatePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="da">
      <TextField
        label={label}
        type="datetime-local"
        error={error}
        helperText={helperText}
        disabled={disabled}
        value={moment(value).format('YYYY-MM-DDTHH:mm')}
        onChange={(e) => {
          onChange(moment(e.target.value).toDate());
        }}
        sx={error ? {} : sx}
        inputProps={{
          max: max ? moment(max).format('YYYY-MM-DDTHH:mm:ss') : null,
          min: min ? moment(min).format('YYYY-MM-DDTHH:mm:ss') : null,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth={fullWidth}
        margin="dense"
      />
    </LocalizationProvider>
  );
};

export default OwnDatePicker;
