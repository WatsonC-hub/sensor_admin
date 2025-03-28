import {Fab, FabProps, SvgIconProps, SxProps, Theme, Typography} from '@mui/material';
import {mergeAll} from 'ramda';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';

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
  const {ts_id} = useAppContext([], ['ts_id']);
  const {isMobile, isTouch} = useBreakpoints();
  let sx: SxProps<Theme> | undefined = {
    position: 'fixed',
    bottom: isMobile || !ts_id ? 65 : 10,
    right: 20,
    padding: 2,
    width: isTouch && !showText ? 75 : 'fit-content',
    height: 60,
    borderRadius: 4.5,
    color: 'white',
  };

  sx = mergeAll([sx, otherProps.sx]);

  return (
    // <div>
    <Fab {...otherProps} color="secondary" aria-label="add" onClick={onClick} sx={sx}>
      {icon}
      {(!isTouch || showText) && <Typography sx={fabTextStyle}>{text}</Typography>}
    </Fab>
    // </div>
  );
};

export default FabWrapper;
