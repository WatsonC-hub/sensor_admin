import {Fab, FabProps, SvgIconProps, Typography} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';

interface Props extends Omit<FabProps, 'variant'> {
  text: string;
  icon: React.ReactElement<SvgIconProps>;
  onClick: () => void;
  showText?: boolean;
}

const FloatingButton = ({text, icon, onClick, showText = false, ...otherProps}: Props) => {
  const {isTouch} = useBreakpoints();

  return (
    <Fab
      color="secondary"
      aria-label="add"
      onClick={onClick}
      {...otherProps}
      sx={{
        width: isTouch && !showText ? 75 : 'fit-content',
        borderRadius: 4.5,
        color: 'white',
        p: 2,
        ...otherProps.sx,
      }}
    >
      {icon}
      {(!isTouch || showText) && (
        <Typography
          sx={{
            padding: 1,
            textTransform: 'initial',
          }}
        >
          {text}
        </Typography>
      )}
    </Fab>
  );
};

export default FloatingButton;
