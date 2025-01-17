import {Card, CardProps, SxProps} from '@mui/material';
import {merge} from 'lodash';
import React, {ReactElement, useState} from 'react';

type Props = CardProps & {
  identity: string | null;
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
  identity,
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

  sx = merge(props.sx, sx);

  return (
    <div>
      <Card
        {...props}
        sx={sx}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onMouseDown={onMouseClick}
        key={identity}
      >
        {children}
      </Card>
    </div>
  );
};

export default GenericCard;
