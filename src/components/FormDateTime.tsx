// FormDateTime.tsx
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import {DateTimePicker, DateTimePickerProps} from '@mui/x-date-pickers/DateTimePicker';

import dayjs from 'dayjs';

export type FormDateTimeProps<TFieldValues extends FieldValues> = Omit<
  DateTimePickerProps,
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
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
        return (
          <DateTimePicker
            label={label}
            value={value}
            onChange={(newValue) => {
              onChange(newValue);
              if (onChangeCallback) onChangeCallback(newValue);
            }}
            reduceAnimations
            timeSteps={{
              minutes: 1,
            }}
            disabled={disabled}
            {...pickerProps}
            slotProps={{
              textField: {
                onBlur: () => {
                  onBlur();
                },
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
                InputLabelProps: {shrink: true},
              },
            }}
          />
        );
      }}
    />
  );
};

export default FormDateTime;
