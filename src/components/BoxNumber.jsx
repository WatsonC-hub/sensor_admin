import {Box} from '@mui/material';

const BoxNumber = ({children, ...rest}) => {
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
