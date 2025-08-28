import React from 'react';
import {Box, TextFieldVariants} from '@mui/material';
import {Controller, FieldValues, Path, useFormContext} from 'react-hook-form';

import dayjs, {Dayjs} from 'dayjs';
import {DatePicker, DatePickerProps, PickersActionBarAction} from '@mui/x-date-pickers';
import CustomActionBar from '~/helpers/CustomActionBar';

export type FormDatePickerProps<TFieldValues extends FieldValues> = Omit<
  DatePickerProps<false>,
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
  customActionLabel?: 'next_control';
  customActionDisabled?: boolean;
};

const FormDatePicker = <TFieldValues extends FieldValues>({
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
}: FormDatePickerProps<TFieldValues>) => {
  const {control} = useFormContext<TFieldValues>();
  return (
    <Controller
      name={name}
      control={control}
      rules={{required}}
      render={({field: {onChange, onBlur, value}, fieldState: {error}}) => {
        return (
          <DatePicker
            {...pickerProps}
            label={label}
            value={value}
            closeOnSelect={false}
            onChange={(newValue) => {
              onChange(newValue);
            }}
            onAccept={(newValue) => {
              onChange(newValue);
              if (onChangeCallback) {
                onChangeCallback(newValue);
              }
            }}
            reduceAnimations
            disabled={disabled}
            slots={{
              actionBar: (props) => {
                return (
                  <Box {...props}>
                    <CustomActionBar
                      customAction={customAction}
                      disabled={customActionDisabled}
                      {...props}
                    />
                  </Box>
                );
              },
            }}
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
              },
              textField: {
                ...slotProps?.textField,
                InputProps: {
                  sx: {
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

export default FormDatePicker;
