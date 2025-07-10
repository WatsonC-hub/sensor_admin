import React from 'react';
import {TextFieldVariants} from '@mui/material';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';
import {DateTimePicker, DateTimePickerProps} from '@mui/x-date-pickers/DateTimePicker';

import dayjs, {Dayjs} from 'dayjs';
import {PickersActionBarAction} from '@mui/x-date-pickers';

export type FormDateTimeProps<TFieldValues extends FieldValues> = Omit<
  DateTimePickerProps<false>,
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
      rules={{required}}
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
        return (
          <DateTimePicker
            {...pickerProps}
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
                InputProps: {
                  sx: {
                    '& .MuiInputBase-input': {
                      padding: '8.2px !important',
                    },
                    '& > fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                },
                onBlur: onBlur,
                margin: margin,
                fullWidth: true,
                error: !!error,
                helperText: error?.message,
                InputLabelProps: {
                  shrink: true,
                  sx: {
                    color: 'primary.main',
                  },
                },
              },
            }}
          />
        );
      }}
    />
  );
};

export default FormDateTime;
