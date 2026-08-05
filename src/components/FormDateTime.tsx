import React from 'react';
import type {TextFieldVariants} from '@mui/material';
import type {FieldValues, Path} from 'react-hook-form';
import {Controller, useFormContext} from 'react-hook-form';
import type {DateTimePickerProps} from '@mui/x-date-pickers/DateTimePicker';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';

import dayjs from 'dayjs';
import type {PickersActionBarAction} from '@mui/x-date-pickers';

export type FormDateTimeProps<TFieldValues extends FieldValues> = Omit<
  DateTimePickerProps,
  'value' | 'onChange' | 'renderInput'
> & {
  name: Path<TFieldValues>;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: Record<string, any>;
  margin?: 'none' | 'dense' | undefined;
  variant?: TextFieldVariants;
  onChangeCallback?: (value: dayjs.Dayjs | null) => void;
};

const FormDateTime = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  margin = 'dense',
  onChangeCallback,
  slotProps,
  ...pickerProps
}: FormDateTimeProps<TFieldValues>) => {
  const {control} = useFormContext<TFieldValues>();
  return (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
        return (
          <DateTimePicker
            {...pickerProps}
            label={label}
            value={value ? dayjs(value) : null}
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
              ...slotProps,
              toolbar: {
                ...slotProps?.toolbar,
                sx: {
                  '& .MuiTypography-root': {
                    textTransform: 'inherit',
                  },
                },
              },
              actionBar: {
                ...slotProps?.actionBar,
                sx: {
                  '& .MuiButton-root': {
                    textTransform: 'inherit',
                  },
                },
                actions: ['cancel', 'clear', 'today', 'accept'] as PickersActionBarAction[],
                disableSpacing: true,
              },
              textField: {
                ...slotProps?.textField,
                required: required,
                slotProps: {
                  input: {
                    sx: {
                      '& > fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                  inputLabel: {
                    shrink: true,
                    sx: {
                      color: 'primary.main',
                    },
                  },
                },
                onBlur: onBlur,
                margin: margin,
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
              },
            }}
          />
        );
      }}
    />
  );
};

export default FormDateTime;
