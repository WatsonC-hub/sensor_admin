import {TextField} from '@mui/material';
import React from 'react';

interface FormTextFieldProps {
  value: string;
  label: string;
  disabled?: boolean;
  type?: string;
}

const FormTextField = ({
  value,
  label,
  disabled = false,
  type = 'text',
  ...rest
}: FormTextFieldProps) => {
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
      type={type}
      {...rest}
    />
  );
};

export default FormTextField;
