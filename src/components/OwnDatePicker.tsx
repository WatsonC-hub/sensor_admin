import {DateTimePicker} from '@mui/x-date-pickers';
import {PickerValue} from '@mui/x-date-pickers/internals';
import dayjs, {Dayjs} from 'dayjs';
import React from 'react';

interface OwnDatePickerProps {
  label: string | React.ReactNode;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  value: Dayjs | null;
  onChange: (date: PickerValue) => void;
  max?: Dayjs | null;
  min?: Dayjs | null;
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
    <DateTimePicker
      label={label}
      minDate={min ? dayjs(min) : undefined}
      maxDate={max ? dayjs(max) : undefined}
      disabled={disabled}
      value={value}
      onChange={(date) => {
        onChange(date);
      }}
      sx={error ? {} : sx}
      slotProps={{
        textField: {
          fullWidth: fullWidth,
          margin: 'dense',
          InputLabelProps: {
            shrink: true,
          },
          error: error,
          helperText: helperText,
        },
      }}
    />
  );
};

export default OwnDatePicker;
