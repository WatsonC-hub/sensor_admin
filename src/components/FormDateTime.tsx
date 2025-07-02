// FormDateTime.tsx
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import {DateTimePicker, DateTimePickerProps} from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';

export type FormDateTimeProps<TFieldValues extends FieldValues> = Omit<
  DateTimePickerProps<dayjs.Dayjs>,
  'value' | 'onChange' | 'renderInput'
> & {
  name: Path<TFieldValues>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onChangeCallback?: (value: dayjs.Dayjs | null) => void;
};

const FormDateTime = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  onChangeCallback,
  ...pickerProps
}: FormDateTimeProps<TFieldValues>) => {
  const {control} = useFormContext<TFieldValues>();

  return (
    <Controller
      name={name}
      control={control}
      rules={{required}}
      render={({field: {onChange, value}, fieldState: {error}}) => {
        return (
          <DateTimePicker
            label={label}
            value={value || null}
            onChange={(newValue) => {
              console.log('New value:', newValue);
              onChange(newValue);
              if (onChangeCallback) onChangeCallback(newValue);
            }}
            disabled={disabled}
            slotProps={{
              textField: {
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
                ...(pickerProps.slotProps?.textField || {}),
              },
            }}
          />
        );
      }}
    />
  );
};

export default FormDateTime;
