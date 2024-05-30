import MuiButton from '@mui/material/Button';
import type {ButtonProps} from '@mui/material';
import {merge} from 'lodash';
import {ReactElement} from 'react';

interface MyButtonProps extends Omit<ButtonProps, 'variant'> {
  btType: 'primary' | 'secondary' | 'tertiary';
  children: ReactElement | string;
}

const Button = ({btType, children, ...props}: MyButtonProps) => {
  let sx = {};
  if (btType === 'primary') {
    sx = {
      textTransform: 'initial',
      my: 0.5,
      p: '0.5rem 1rem',
      borderRadius: 9999,
      backgroundColor: 'primary.main',
      color: 'white',
      '&:hover': {
        backgroundColor: 'primary.dark',
      },
      '&:disabled': {
        backgroundColor: 'grey.200',
      },
    };
  }

  if (btType === 'tertiary') {
    sx = {
      textTransform: 'initial',
      my: 0.5,
      p: '0.5rem 1rem',
      borderRadius: 9999,
      backgroundColor: '#ffffff',
      borderColor: '#cacaca',
    };
  }

  sx = merge(sx, props.sx);

  return (
    <MuiButton {...props} variant="outlined" sx={sx}>
      {children}
    </MuiButton>
  );
};

export default Button;
