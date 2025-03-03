import {Fab, FabProps, SvgIconProps, Typography} from '@mui/material';
import {merge} from 'lodash';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';

interface Props extends Omit<FabProps, 'variant'> {
  text: string;
  icon: React.ReactElement<SvgIconProps>;
  onClick: () => void;
}

const fabTextStyle = {
  padding: 1,
  textTransform: 'initial',
};

const FabWrapper = ({text, icon, onClick, ...otherProps}: Props) => {
  const {isTouch} = useBreakpoints();
  let sx = {
    position: 'fixed',
    bottom: 65,
    right: 20,
    width: isTouch ? 75 : 200,
    height: 60,
    borderRadius: 4.5,
    color: 'white',
  };

  sx = merge(sx, otherProps.sx);

  return (
    <div>
      <Fab {...otherProps} color="secondary" aria-label="add" onClick={onClick} sx={sx}>
        {icon}
        {!isTouch && <Typography sx={fabTextStyle}>{text}</Typography>}
      </Fab>
    </div>
  );
};

export default FabWrapper;
