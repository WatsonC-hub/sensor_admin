import {Fab, SvgIconProps, Typography} from '@mui/material';
import React from 'react';

interface Props {
  children: React.ReactNode;
  text: string;
  icon: React.ReactElement<SvgIconProps>;
  onClick: () => void;
}

const fabTextStyle = {
  padding: 1,
  textTransform: 'initial',
};

const FabWrapper = ({children, text, icon, onClick}: Props) => {
  return (
    <div>
      {children}
      <Fab
        color="secondary"
        aria-label="add"
        onClick={onClick}
        sx={{
          position: 'fixed',
          bottom: 65,
          right: 20,
          width: 200,
          height: 60,
          borderRadius: 4.5,
          color: 'white',
        }}
      >
        <>
          {icon}
          <Typography sx={fabTextStyle}>{text}</Typography>
        </>
      </Fab>
    </div>
  );
};

export default FabWrapper;
