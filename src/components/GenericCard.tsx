import {Card, CardProps, SxProps} from '@mui/material';
import {merge} from 'lodash';
import React, {ReactElement, useState} from 'react';

type Props = CardProps & {
  id: string | null;
  // data?: TValues;
  shadowIn?: number;
  shadowOut?: number;
  shadowClick?: number;
};

const GenericCard = ({
  shadowIn = 3,
  shadowOut = 1,
  shadowClick = 6,
  children,
  id,
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

  let sx: SxProps = {
    boxShadow: shadow,
  };

  sx = merge(sx, props.sx);

  return (
    <div>
      <Card
        {...props}
        sx={sx}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onMouseDown={onMouseClick}
        id={id}
      >
        {children}
      </Card>
    </div>
  );
};

export default GenericCard;
