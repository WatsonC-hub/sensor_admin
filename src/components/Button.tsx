import type {ButtonProps} from '@mui/material';
import MuiButton from '@mui/material/Button';
import {merge} from 'lodash';

interface MyButtonProps extends Omit<ButtonProps, 'variant'> {
  bttype: 'primary' | 'secondary' | 'tertiary' | 'link' | 'itinerary' | 'danger' | 'progress';
  children: React.ReactNode;
  target?: string;
}

const Button = ({bttype, children, ...props}: MyButtonProps) => {
  const baseSx = {
    textTransform: 'initial',
    my: 0.5,
    p: '0.5rem 1rem',
    borderRadius: 9999,
    '&:hover': {
      filter: 'brightness(90%)',
      transition: '0.3s',
    },
  };
  let sx = {};
  if (bttype === 'primary') {
    sx = {
      ...baseSx,
      backgroundColor: 'primary.main',
      color: 'white',
      '&:disabled': {
        backgroundColor: 'grey.200',
      },
    };
  }

  if (bttype === 'tertiary') {
    sx = {
      ...baseSx,
      backgroundColor: '#ffffff',
      borderColor: '#cacaca',
    };
  }

  if (bttype === 'itinerary') {
    sx = {
      ...baseSx,
      backgroundColor: 'white',
      '&:disabled': {
        backgroundColor: 'grey.200',
      },
    };
  }

  if (bttype === 'progress') {
    sx = {
      ...baseSx,
      backgroundColor: 'info.main',
      color: 'white',
    };
  }

  if (bttype === 'danger') {
    sx = {
      ...baseSx,
      backgroundColor: '#d32f2f',
      borderColor: '#d32f2f',
      color: 'white',
      '&:disabled': {
        backgroundColor: 'grey.200',
      },
    };
  }

  sx = merge({}, sx, props.sx);

  return (
    <MuiButton {...props} variant={bttype == 'link' ? 'text' : 'outlined'} sx={sx}>
      {children}
    </MuiButton>
  );
};

export default Button;
