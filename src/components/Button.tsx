import MuiButton from '@mui/material/Button';
import type {ButtonProps} from '@mui/material';
import {merge} from 'lodash';

interface MyButtonProps extends Omit<ButtonProps, 'variant'> {
  btType: 'primary' | 'secondary';
}

const Button = (props: MyButtonProps) => {
  let sx = {};
  if (props.btType === 'primary') {
    sx = {
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

  if (props.btType === 'secondary') {
    sx = {
      my: 0.5,
      p: '0.5rem 1rem',
      borderRadius: 9999,
    };
  }

  sx = merge(sx, props.sx);

  return <MuiButton {...props} variant="outlined" sx={sx} />;
};

export default Button;
