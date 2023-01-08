import React from 'react';
import {TextField} from '@mui/material';

const FormTextField = (props) => {
  const {value, onChange, label, disabled, ...rest} = props;
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
      value={value}
      onChange={onChange}
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