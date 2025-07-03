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
  margin?: 'none' | 'dense' | undefined;
  variant?: 'filled' | 'outlined' | 'standard';
  onChangeCallback?: (value: dayjs.Dayjs | null) => void;
  warning?: (value: dayjs.Dayjs | null) => string | undefined;
};

const FormDateTime = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  margin = 'dense',
  variant = 'outlined',
  onChangeCallback,
  warning,
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
            {...pickerProps}
            slotProps={{
              textField: {
                onBlur: onBlur,
                variant: variant,
                margin: margin,
                sx: {
                  '& .MuiOutlinedInput-root': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: !error ? 'primary.main' : undefined,
                    },
                  },
                },
                slotProps: {
                  formHelperText: {
                    sx: {
                      color: error ? 'red' : warning ? 'orange' : undefined,
                      position: 'absolute',
                      top: 'calc(100% - 8px)',
                    },
                  },
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
