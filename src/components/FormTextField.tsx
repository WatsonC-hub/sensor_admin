import {TextField, TextFieldProps} from '@mui/material';
import React from 'react';
import {FieldError} from 'react-hook-form';

export type FormTextFieldProps = {
  value: string;
  label: string;
  disabled: boolean;
  formError?: FieldError;
  type?: string;
  margin?: 'none' | 'dense' | 'normal';
  variant?: 'outlined' | 'filled' | 'standard';
  // onChangeCallback?: (value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | number) => void;
  // onBlurCallback?: (value: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | number) => void;
} & TextFieldProps;

const FormTextField = ({
  value,
  label,
  disabled,
  formError,
  type,
  margin = 'dense',
  variant = 'outlined',
  // onChangeCallback,
  // onBlurCallback,
  slotProps,
  ...rest
}: FormTextFieldProps) => {
  return (
    <TextField
      sx={{
        pb: 1,
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: '#000000',
        },
        '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
        '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
        '& .MuiOutlinedInput-root': {
          '& > fieldset': {borderColor: 'primary.main'},
        },
      }}
      disabled={disabled}
      variant={variant}
      type={type}
      margin={margin}
      id={label}
      value={value ?? ''}
      label={label}
      fullWidth
      slotProps={{
        ...slotProps,
        htmlInput: {
          ...slotProps?.htmlInput,
          sx: {
            borderColor: 'primary.main',
            '& .Mui-focused': {
              borderColor: 'primary.main',
            },
          },
        },
        input: {
          sx: {
            '& .Mui-disabled': {
              WebkitTextFillColor: '#000000',
              color: 'rgba(0, 0, 0, 0.38)',
            },

            '& > fieldset': {
              borderColor: 'primary.main',
            },
          },
          ...(type === 'number'
            ? {
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  display: 'none',
                },
                '& input[type=number]': {
                  MozAppearance: 'textfield',
                },
              }
            : {}),
          ...slotProps?.input,
        },
        formHelperText: {
          sx: {
            color: formError ? 'red' : undefined,
            position: 'absolute',
            top: 'calc(100% - 8px)',
          },
          ...slotProps?.formHelperText,
        },
        inputLabel: {
          ...slotProps?.inputLabel,
          shrink: true,

          sx: {
            '& .Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'},
            color: 'primary.main',
            zIndex: 0,
          },
        },
      }}
      {...rest}
    />
  );
};

FormTextField.defaultProps = {
  disabled: false,
  type: 'text',
};

export default FormTextField;
