// FormDateTime.tsx
import React from 'react';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import {DateTimePicker, DateTimePickerProps} from '@mui/x-date-pickers/DateTimePicker';

import dayjs from 'dayjs';
import {PickersActionBarAction} from '@mui/x-date-pickers';

export type FormDateTimeProps<TFieldValues extends FieldValues> = Omit<
  DateTimePickerProps,
  'value' | 'onChange' | 'renderInput'
> & {
  name: Path<TFieldValues>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  margin?: 'none' | 'dense' | undefined;
  variant?: 'filled' | 'outlined' | 'standard';
  onChangeCallback?: (value: dayjs.Dayjs | null) => void;
};

const FormDateTime = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  margin = 'dense',
  variant = 'outlined',
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
            ampmInClock={false}
            slotProps={{
              toolbar: {
                sx: {
                  '& .MuiTypography-root': {
                    textTransform: 'inherit',
                  },
                },
              },
              actionBar: {
                sx: {
                  '& .MuiButton-root': {
                    textTransform: 'inherit',
                  },
                },
                actions: ['cancel', 'clear', 'today', 'accept'] as PickersActionBarAction[],
              },
              textField: {
                onBlur: onBlur,
                variant: variant,
                margin: margin,
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
                InputLabelProps: {shrink: true},
                sx: {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              },
            }}
            {...pickerProps}
          />
        );
      }}
    />
  );
};

export default FormDateTime;
