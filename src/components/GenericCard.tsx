import {Theme, Card, CardProps, SxProps} from '@mui/material';

import {mergeAll} from 'ramda';
import React, {ReactElement, useState} from 'react';

type Props = CardProps & {
  shadowIn?: number;
  shadowOut?: number;
  shadowClick?: number;
};

const GenericCard = ({
  shadowIn = 3,
  shadowOut = 1,
  shadowClick = 6,
  children,
  ...props
}: Props): ReactElement => {
  const [shadow, setShadow] = useState<number>(1);

  const onMouseOver = () => {
    setShadow(shadowIn);
  };

  const onMouseOut = () => {
    setShadow(shadowOut);
  };

  const onMouseClick = () => {
    setShadow(shadowClick);
  };

  let sx: SxProps<Theme> | undefined = {
    boxShadow: shadow,
  };

  sx = mergeAll([sx, props.sx]);

  return (
    <Card
      {...props}
      sx={sx}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onMouseDown={onMouseClick}
    >
      {children}
    </Card>
  );
};

export default GenericCard;
