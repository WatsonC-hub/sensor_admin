import type {ButtonProps} from '@mui/material';
import MuiButton from '@mui/material/Button';
import {merge} from 'lodash';

interface MyButtonProps extends Omit<ButtonProps, 'variant'> {
  bttype: 'primary' | 'secondary' | 'tertiary' | 'link' | 'itinerary';
  children: React.ReactNode;
  target?: string;
}

const Button = ({bttype, children, ...props}: MyButtonProps) => {
  let sx = {};
  if (bttype === 'primary') {
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

  if (bttype === 'tertiary') {
    sx = {
      textTransform: 'initial',
      my: 0.5,
      p: '0.5rem 1rem',
      borderRadius: 9999,
      backgroundColor: '#ffffff',
      borderColor: '#cacaca',
    };
  }

  if (bttype === 'itinerary') {
    sx = {
      textTransform: 'initial',
      my: 0.5,
      p: '0.25rem 1rem',
      borderRadius: 9999,
      backgroundColor: 'white',
      '&:disabled': {
        backgroundColor: 'grey.200',
      },
    };
  }

  sx = merge({}, props.sx, sx);

  return (
    <MuiButton {...props} variant={bttype == 'link' ? 'text' : 'outlined'} sx={sx}>
      {children}
    </MuiButton>
  );
};

export default Button;
