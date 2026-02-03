import {TextField, TextFieldProps} from '@mui/material';
import React from 'react';

type FormTextFieldProps = {
  value: string | number;
  label: string;
  disabled: boolean;
} & TextFieldProps;

const FormTextField = ({value, label, disabled, ...rest}: FormTextFieldProps) => {
  return (
    <TextField
      sx={{
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
      variant="outlined"
      id={label}
      value={value ?? ''}
      label={label}
      InputLabelProps={{shrink: true}}
      fullWidth
      margin="dense"
      {...rest}
    />
  );
};

FormTextField.defaultProps = {
  disabled: false,
  type: 'text',
};

export default FormTextField;
