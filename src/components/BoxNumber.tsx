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
        border: '1px solid',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        backgroundColor: 'info.main',
        marginRight: '10px',
        ...rest,
      }}
    >
      {children}
    </Box>
  );
};

export default BoxNumber;
