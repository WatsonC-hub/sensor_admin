import {Box, type TextFieldVariants} from '@mui/material';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';

import CustomActionBar from '~/helpers/CustomActionBar';

import type {PickersActionBarAction} from '@mui/x-date-pickers';
import type {DateTimePickerProps} from '@mui/x-date-pickers/DateTimePicker';
import type {FieldValues, Path} from 'react-hook-form';

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
  customAction?: () => void;
  customActionLabel?: string;
  customActionDisabled?: boolean;
};

const FormDateTime = <TFieldValues extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  margin = 'dense',
  onChangeCallback,
  customAction,
  customActionLabel,
  customActionDisabled,
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
            value={value}
            onChange={(newValue) => {
              onChange(newValue ? dayjs(newValue) : null);
              if (onChangeCallback) onChangeCallback(newValue ? dayjs(newValue) : null);
            }}
            reduceAnimations
            timeSteps={{
              minutes: 1,
            }}
            disabled={disabled}
            ampmInClock={false}
            slots={
              customActionLabel
                ? {
                    actionBar: (actionBarProps) => (
                      <Box {...actionBarProps}>
                        <CustomActionBar
                          customAction={customAction}
                          disabled={customActionDisabled}
                          label={customActionLabel}
                          {...actionBarProps}
                        />
                      </Box>
                    ),
                  }
                : undefined
            }
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
                actions: [
                  'cancel',
                  'clear',
                  'today',
                  'accept',
                  ...(customActionLabel ? [customActionLabel] : []),
                ] as PickersActionBarAction[],
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
