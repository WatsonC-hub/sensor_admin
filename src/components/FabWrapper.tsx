import {Box, Fab, FabProps, SvgIconProps, Typography} from '@mui/material';
import {merge} from 'lodash';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';

interface Props extends Omit<FabProps, 'variant'> {
  text: string;
  icon: React.ReactElement<SvgIconProps>;
  onClick: () => void;
  showText?: boolean;
}

const fabTextStyle = {
  padding: 1,
  textTransform: 'initial',
};

const FabWrapper = ({text, icon, onClick, showText = false, ...otherProps}: Props) => {
  const {isTouch} = useBreakpoints();
  let sx = {
    position: 'sticky',
    bottom: 10,
    right: 20,
    ml: 'auto',
  };

  sx = merge(sx, otherProps.sx);

  return (
    <Box sx={sx}>
      <Fab
        {...otherProps}
        color="secondary"
        aria-label="add"
        onClick={onClick}
        sx={{
          width: isTouch && !showText ? 75 : 'fit-content',
          borderRadius: 4.5,
          color: 'white',
          p: 2,
        }}
      >
        {icon}
        {(!isTouch || showText) && <Typography sx={fabTextStyle}>{text}</Typography>}
      </Fab>
    </Box>
  );
};

export default FabWrapper;
