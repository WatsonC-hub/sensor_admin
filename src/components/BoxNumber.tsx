import {Box} from '@mui/material';
import {ReactNode} from 'react';

interface BoxNumberProps {
  children: ReactNode;
}

const BoxNumber = ({children, ...rest}: BoxNumberProps) => {
  return (
    <Box
      sx={{
        width: '20px',
        height: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
        marginRight: '10px',
        ...rest,
      }}
    >
      {children}
    </Box>
  );
};

export default BoxNumber;
