import Box from '@mui/material/Box';
import React from 'react';

type Props = {
  children: React.ReactNode;
  sx?: object;
  label: string;
};

const FormFieldset = ({children, sx = {}, label}: Props) => {
  return (
    <Box
      sx={{
        // position: 'relative',
        border: '2px solid',
        borderColor: 'grey.300',
        borderRadius: 2,
        padding: 2,
        marginTop: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        // width: 'fit-content',

        ...sx,
      }}
    >
      <Box
        component="legend"
        sx={{
          position: 'relative',
          top: -28,
          //   left: 5,
          width: 'fit-content',
          backgroundColor: 'background.paper',
          color: 'grey.700',
          px: 1,
          fontSize: '0.875rem',
          mb: -4,
        }}
      >
        {label}
      </Box>
      {children}
    </Box>
  );
};

export default FormFieldset;
